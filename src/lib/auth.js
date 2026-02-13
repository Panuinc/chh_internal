import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { AUTH_MESSAGES } from "@/lib/auth-messages";
import { createLogger } from "@/lib/shared/logger-edge";
import { createRefreshToken } from "@/features/auth/services/refreshToken.service";

const logger = createLogger("next-auth");

class InvalidCredentialsError extends CredentialsSignin {
  code = AUTH_MESSAGES.INVALID_CREDENTIALS;
}
class AccountInactiveError extends CredentialsSignin {
  code = AUTH_MESSAGES.ACCOUNT_INACTIVE;
}
class EmployeeInactiveError extends CredentialsSignin {
  code = AUTH_MESSAGES.EMPLOYEE_INACTIVE;
}
class MissingCredentialsError extends CredentialsSignin {
  code = AUTH_MESSAGES.MISSING_CREDENTIALS;
}
class LoginError extends CredentialsSignin {
  code = AUTH_MESSAGES.LOGIN_ERROR;
}

const ACCESS_TOKEN_MAX_AGE = 15 * 60;

export const authOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, request) {
        try {
          if (!credentials?.username || !credentials?.password) {
            throw new MissingCredentialsError();
          }

          const account = await prisma.account.findFirst({
            where: { accountUsername: credentials.username },
            include: {
              accountEmployee: {
                include: {
                  employeeRoles: {
                    where: {
                      role: {
                        roleStatus: "Active",
                      },
                    },
                    include: {
                      role: {
                        include: {
                          rolePermissions: {
                            where: {
                              permission: {
                                permissionStatus: "Active",
                              },
                            },
                            include: {
                              permission: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          if (!account) throw new InvalidCredentialsError();
          if (account.accountStatus !== "Active")
            throw new AccountInactiveError();
          if (account.accountEmployee.employeeStatus !== "Active")
            throw new EmployeeInactiveError();

          const valid = await bcrypt.compare(
            credentials.password,
            account.accountPassword,
          );

          if (!valid) throw new InvalidCredentialsError();

          const permissionsSet = new Set();
          account.accountEmployee.employeeRoles.forEach((employeeRole) => {
            if (employeeRole.role && employeeRole.role.rolePermissions) {
              employeeRole.role.rolePermissions.forEach((rolePermission) => {
                if (rolePermission.permission) {
                  permissionsSet.add(rolePermission.permission.permissionName);
                }
              });
            }
          });
          const permissions = Array.from(permissionsSet);

          const metadata = {
            ipAddress: request.headers?.get("x-forwarded-for") || null,
            userAgent: request.headers?.get("user-agent") || null,
          };

          const refreshTokenData = await createRefreshToken(
            account.accountId,
            metadata,
          );

          return {
            id: account.accountEmployee.employeeId,
            accountId: account.accountId,
            username: account.accountUsername,
            email: account.accountEmployee.employeeEmail,
            name: `${account.accountEmployee.employeeFirstName} ${account.accountEmployee.employeeLastName}`,
            firstName: account.accountEmployee.employeeFirstName,
            lastName: account.accountEmployee.employeeLastName,
            permissions,
            isSuperAdmin: permissions.includes("superadmin"),
            refreshToken: refreshTokenData.token,
            refreshTokenExpires: refreshTokenData.expiresAt.toISOString(),
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) throw error;
          logger.error({ message: "Authorize error", error: error.message });
          throw new LoginError();
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.accountId = user.accountId;
        token.username = user.username;
        token.email = user.email;
        token.name = user.name;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.permissions = user.permissions;
        token.isSuperAdmin = user.isSuperAdmin;
        token.refreshToken = user.refreshToken;
        token.refreshTokenExpires = user.refreshTokenExpires;
        // Store expiresAt as seconds (Unix timestamp) to match JWT exp claim format
        token.expiresAt = Math.floor(Date.now() / 1000) + ACCESS_TOKEN_MAX_AGE;
      }

      if (trigger === "update" && session) {
        // Update expiresAt as seconds (Unix timestamp) to match JWT exp claim format
        token.expiresAt = Math.floor(Date.now() / 1000) + ACCESS_TOKEN_MAX_AGE;
        if (session.refreshToken) {
          token.refreshToken = session.refreshToken;
        }
        if (session.refreshTokenExpires) {
          token.refreshTokenExpires = session.refreshTokenExpires;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.accountId = token.accountId;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.permissions = token.permissions;
        session.user.isSuperAdmin = token.isSuperAdmin;
        // expiresAt is in seconds, convert to milliseconds for session
        session.user.accessTokenExpires = token.expiresAt * 1000;

        const expiresInMs = token.expiresAt * 1000 - Date.now();
        session.user.accessTokenExpired = expiresInMs < 5 * 60 * 1000;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signIn",
    error: "/signIn",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: ACCESS_TOKEN_MAX_AGE,
  },

  trustHost: true,
};

const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

export { handlers, signIn, signOut, auth };

export function hasPermission(session, permission) {
  if (!session?.user) return false;
  if (session.user.isSuperAdmin) return true;
  return session.user.permissions?.includes(permission) || false;
}
