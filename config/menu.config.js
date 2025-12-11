import {
  Settings,
  User2,
  Building2,
  Users,
  CalendarCheck,
  FileText,
  Shield,
  Database,
  ScrollText,
} from "lucide-react";

export const menuConfig = {
  modules: [
    {
      id: "setting",
      href: "/setting",
      text: "Setting",
      icon: Settings,
      permission: "setting.view",
    },
    {
      id: "hr",
      href: "/hr",
      text: "Human Resource",
      icon: User2,
      permission: "hr.view",
    },
  ],

  submenus: {
    setting: {
      title: "Setting",
      icon: Settings,
      description: "Manage system configurations",
      items: [
        {
          id: "aa",
          href: "/setting/aa",
          text: "AA",
          icon: FileText,
          permission: "setting.aa.view",
        },
        {
          id: "bb",
          href: "/setting/bb",
          text: "BB",
          icon: Shield,
          permission: "setting.bb.view",
        },
        {
          id: "cc",
          href: "/setting/cc",
          text: "CC",
          icon: Database,
          permission: "setting.cc.view",
        },
      ],
    },
    hr: {
      title: "Human Resource",
      icon: User2,
      description: "Manage employees and departments",
      items: [
        {
          id: "department",
          href: "/hr/department",
          text: "Department",
          icon: Building2,
          permission: "hr.department.view",
        },
        {
          id: "employee",
          href: "/hr/employee",
          text: "Employee",
          icon: Users,
          permission: "hr.employee.view",
        },
        {
          id: "attendance",
          href: "/hr/attendance",
          text: "Attendance",
          icon: CalendarCheck,
          permission: "hr.attendance.view",
        },
        {
          id: "permission",
          href: "/hr/permission",
          text: "Permission",
          icon: ScrollText,
          permission: "hr.permission.view",
        },
      ],
    },
  },
};

export default menuConfig;
