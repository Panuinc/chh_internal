import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { AUTH_MESSAGES } from "@/lib/auth-messages";

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
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

          return {
            id: account.accountEmployee.employeeId,
            accountId: account.accountId,
            username: account.accountUsername,
            email: account.accountEmployee.employeeEmail,
            name: `${account.accountEmployee.employeeFirstName} ${account.accountEmployee.employeeLastName}`,
            firstName: account.accountEmployee.employeeFirstName,
            lastName: account.accountEmployee.employeeLastName,
            permissions,
            isSuperAdmin: permissions.includes("superAdmin"),
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) throw error;
          console.error("Authorize error:", error);
          throw new LoginError();
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
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
    maxAge: 8 * 60 * 60,
  },

  trustHost: true,
});
