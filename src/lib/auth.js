import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { AUTH_MESSAGES } from "@/lib/auth-messages";
import { createLogger } from "@/lib/shared/logger";
import { createRefreshToken } from "@/services/auth/refreshToken.service";


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

// Access Token อายุ 15 นาที
const ACCESS_TOKEN_MAX_AGE = 15 * 60; // วินาที

export const { handlers, signIn, signOut, auth } = NextAuth({
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
                  assigns: {
                    include: {
                      permission: true,
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
            account.accountPassword
          );

          if (!valid) throw new InvalidCredentialsError();

          const permissions = account.accountEmployee.assigns
            .filter((a) => a.permission.permissionStatus === "Active")
            .map((a) => a.permission.permissionName);

          // สร้าง Refresh Token
          const metadata = {
            ipAddress: request.headers?.get("x-forwarded-for") || null,
            userAgent: request.headers?.get("user-agent") || null,
          };

          const refreshTokenData = await createRefreshToken(
            account.accountId,
            metadata
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
      // เมื่อ login สำเร็จ (มี user object)
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
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_MAX_AGE * 1000;
      }

      // ถ้าเป็นการ update session จาก client
      if (trigger === "update" && session) {
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_MAX_AGE * 1000;
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
        session.user.accessTokenExpires = token.accessTokenExpires;
        
        // ตรวจสอบว่า access token ใกล้หมดอายุหรือไม่ (เหลือน้อยกว่า 5 นาที)
        const expiresIn = token.accessTokenExpires - Date.now();
        session.user.accessTokenExpired = expiresIn < 5 * 60 * 1000;
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
    maxAge: 30 * 24 * 60 * 60, // 30 วัน (ใช้สำหรับ refresh token)
  },

  jwt: {
    maxAge: ACCESS_TOKEN_MAX_AGE, // 15 นาที (access token)
  },

  trustHost: true,
});
