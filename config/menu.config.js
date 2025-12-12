import {
  Settings,
  User2,
  Building2,
  Users,
  FileText,
  Shield,
  Database,
  ScrollText,
  Key,
} from "lucide-react";

export const menuConfig = {
  modules: [
    {
      id: "hr",
      href: "/hr",
      text: "Human Resource",
      icon: User2,
      permission: "hr.view",
    },
  ],

  submenus: {
    hr: {
      title: "Human Resource",
      icon: User2,
      description: "Manage employees and departments",
      items: [
        {
          id: "employee",
          href: "/hr/employee",
          text: "Employee",
          icon: Users,
          permission: "hr.employee.view",
        },
        {
          id: "permission",
          href: "/hr/permission",
          text: "Permission",
          icon: ScrollText,
          permission: "hr.permission.view",
        },
        {
          id: "department",
          href: "/hr/department",
          text: "Department",
          icon: Building2,
          permission: "hr.department.view",
        },
         {
          id: "assignPermission",
          href: "/hr/assignPermission",
          text: "AssignPermission",
          icon: Key,
          permission: "hr.assignPermission.view",
        },
      ],
    },
  },
};

export default menuConfig;
