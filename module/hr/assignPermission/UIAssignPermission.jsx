"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
} from "@heroui/react";
import { ModulePage, showToast, LoadingState } from "@/components";
import {
  Key,
  Shield,
  Users,
  Save,
  RefreshCw,
  Search,
  CheckCircle2,
  Circle,
} from "lucide-react";

export default function UIAssignPermission() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [checkedPermIds, setCheckedPermIds] = useState([]);
  const [originalPermIds, setOriginalPermIds] = useState([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [empRes, permRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/permissions"),
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(Array.isArray(empData) ? empData : empData.data || []);
      }

      if (permRes.ok) {
        const permData = await permRes.json();
        setPermissions(
          Array.isArray(permData) ? permData : permData.data || []
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("danger", "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    if (!searchTerm) return employees;
    return employees.filter(
      (emp) =>
        emp.empFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const groupedPermissions = useMemo(() => {
    if (!Array.isArray(permissions) || permissions.length === 0) return {};

    const groups = {};

    permissions.forEach((perm) => {
      const parts = perm.permName.split(".");
      let module;

      if (parts.length === 1) {
        module = "ระบบ";
      } else {
        module = parts[0].toUpperCase();
      }

      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(perm);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.permName.localeCompare(b.permName));
    });

    return groups;
  }, [permissions]);

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmpId(empId);

    const emp = employees.find((e) => e.empId === empId);
    setSelectedEmployee(emp);

    if (emp) {
      const currentPermIds = emp.permissions?.map((p) => p.permId) || [];
      setCheckedPermIds(currentPermIds);
      setOriginalPermIds(currentPermIds);
    } else {
      setCheckedPermIds([]);
      setOriginalPermIds([]);
    }
  };

  const handlePermissionToggle = (permId) => {
    setCheckedPermIds((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const handleSelectAllModule = (modulePerms) => {
    const permIds = modulePerms.map((p) => p.permId);
    const allSelected = permIds.every((id) => checkedPermIds.includes(id));

    if (allSelected) {
      setCheckedPermIds((prev) => prev.filter((id) => !permIds.includes(id)));
    } else {
      setCheckedPermIds((prev) => {
        const newSet = new Set([...prev, ...permIds]);
        return Array.from(newSet);
      });
    }
  };

  const isModuleAllSelected = (modulePerms) => {
    return modulePerms.every((p) => checkedPermIds.includes(p.permId));
  };

  const isModuleSomeSelected = (modulePerms) => {
    return (
      modulePerms.some((p) => checkedPermIds.includes(p.permId)) &&
      !isModuleAllSelected(modulePerms)
    );
  };

  const addedPermIds = checkedPermIds.filter(
    (id) => !originalPermIds.includes(id)
  );
  const removedPermIds = originalPermIds.filter(
    (id) => !checkedPermIds.includes(id)
  );
  const hasChanges = addedPermIds.length > 0 || removedPermIds.length > 0;

  const handleSave = async () => {
    if (!selectedEmployee || !hasChanges) return;

    setIsSaving(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const permId of addedPermIds) {
        try {
          const res = await fetch(
            `/api/employees/${selectedEmployee.empId}/permissions`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ permId }),
            }
          );
          if (res.ok) successCount++;
          else failCount++;
        } catch {
          failCount++;
        }
      }

      for (const permId of removedPermIds) {
        const empPerm = selectedEmployee.permissions?.find(
          (p) => p.permId === permId
        );
        if (empPerm) {
          try {
            const res = await fetch(
              `/api/employees/${selectedEmployee.empId}/permissions?empPermId=${empPerm.empPermId}`,
              { method: "DELETE" }
            );
            if (res.ok) successCount++;
            else failCount++;
          } catch {
            failCount++;
          }
        }
      }

      if (successCount > 0) {
        const message = `อัพเดท ${successCount} รายการ${
          failCount > 0 ? ` (ล้มเหลว ${failCount})` : ""
        }`;
        showToast(failCount > 0 ? "warning" : "success", message);

        await fetchData();

        const updatedEmployees = await fetch("/api/employees").then((r) =>
          r.json()
        );
        const empList = Array.isArray(updatedEmployees)
          ? updatedEmployees
          : updatedEmployees.data || [];
        const updatedEmp = empList.find((e) => e.empId === selectedEmpId);

        if (updatedEmp) {
          setSelectedEmployee(updatedEmp);
          const currentPermIds =
            updatedEmp.permissions?.map((p) => p.permId) || [];
          setCheckedPermIds(currentPermIds);
          setOriginalPermIds(currentPermIds);
        }
      } else {
        showToast("danger", "ไม่สามารถบันทึกได้");
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      showToast("danger", "ไม่สามารถบันทึกได้");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setCheckedPermIds(originalPermIds);
  };

  const getPermissionLabel = (permName) => {
    const parts = permName.split(".");
    if (parts.length === 1) return permName;
    return parts.slice(1).join(".");
  };

  if (!session?.user?.isSuperAdmin) {
    return (
      <ModulePage
        icon={<Key />}
        title="Assign Permission"
        description="คุณไม่มีสิทธิ์เข้าถึงหน้านี้"
        showSidebar={false}
      >
        <div className="col-span-full flex flex-col items-center justify-center gap-2 text-danger">
          <Shield size={64} />
          <p className="text-xl">
            เฉพาะ Super Admin เท่านั้นที่สามารถจัดการ Permission ได้
          </p>
        </div>
      </ModulePage>
    );
  }

  if (isLoading) {
    return (
      <ModulePage
        icon={<Key />}
        title="Assign Permission"
        description="จัดการ Permission ให้กับพนักงาน"
        showSidebar={false}
      >
        <div className="col-span-full flex items-center justify-center h-full">
          <LoadingState label="กำลังโหลดข้อมูล..." />
        </div>
      </ModulePage>
    );
  }

  return (
    <ModulePage
      icon={<Key />}
      title="Assign Permission"
      description="จัดการ Permission ให้กับพนักงาน"
      showSidebar={false}
    >
      <div className="col-span-full flex flex-col xl:flex-row w-full h-full gap-2 p-2 overflow-hidden">
        <Card className="w-full xl:w-1/3 xl:min-w-80 h-fit xl:h-full">
          <CardHeader className="flex items-center gap-2 pb-0">
            <Users size={20} />
            <span className="font-semibold">เลือกพนักงาน</span>
          </CardHeader>
          <CardBody className="gap-2">
            <Input
              placeholder="ค้นหาพนักงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search size={16} />}
              size="sm"
            />

            <Select
              label="พนักงาน"
              placeholder="เลือกพนักงาน"
              selectedKeys={selectedEmpId ? [selectedEmpId] : []}
              onChange={handleEmployeeChange}
              classNames={{
                trigger: "h-14",
              }}
            >
              {filteredEmployees.map((emp) => (
                <SelectItem
                  key={emp.empId}
                  textValue={`${emp.empFirstName} ${emp.empLastName}`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {emp.empFirstName} {emp.empLastName}
                    </span>
                    <span className="text-xs text-foreground/50">
                      {emp.empEmail}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </Select>

            {selectedEmployee && (
              <div className="flex flex-col gap-2 p-2 bg-foreground/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    {selectedEmployee.empFirstName}{" "}
                    {selectedEmployee.empLastName}
                  </span>
                  {selectedEmployee.isSuperAdmin && (
                    <Chip size="sm" color="success" variant="flat">
                      Super Admin
                    </Chip>
                  )}
                </div>

                <Divider />

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Username:</span>
                    <span>{selectedEmployee.username || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Email:</span>
                    <span className="text-xs">{selectedEmployee.empEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Permissions:</span>
                    <span className="font-semibold">
                      {originalPermIds.length} รายการ
                    </span>
                  </div>
                </div>

                {hasChanges && (
                  <>
                    <Divider />
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium">
                        การเปลี่ยนแปลง:
                      </span>
                      {addedPermIds.length > 0 && (
                        <div className="flex items-center gap-2 text-success text-sm">
                          <CheckCircle2 size={14} />
                          <span>เพิ่มใหม่ {addedPermIds.length} รายการ</span>
                        </div>
                      )}
                      {removedPermIds.length > 0 && (
                        <div className="flex items-center gap-2 text-danger text-sm">
                          <Circle size={14} />
                          <span>ลบออก {removedPermIds.length} รายการ</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedEmployee && (
              <div className="flex gap-2">
                <Button
                  variant="bordered"
                  className="flex-1"
                  onPress={handleReset}
                  isDisabled={!hasChanges}
                  startContent={<RefreshCw size={16} />}
                >
                  รีเซ็ต
                </Button>
                <Button
                  color="primary"
                  className="flex-1 bg-foreground text-background"
                  onPress={handleSave}
                  isDisabled={!hasChanges}
                  isLoading={isSaving}
                  startContent={!isSaving && <Save size={16} />}
                >
                  บันทึก
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="w-full xl:w-2/3 h-full overflow-hidden">
          <CardHeader className="flex items-center justify-between pb-0">
            <div className="flex items-center gap-2">
              <Shield size={20} />
              <span className="font-semibold">Permissions</span>
              {selectedEmployee && (
                <Chip size="sm" variant="flat">
                  {checkedPermIds.length} / {permissions.length}
                </Chip>
              )}
            </div>
            <Button
              size="sm"
              variant="light"
              onPress={fetchData}
              startContent={<RefreshCw size={14} />}
            >
              รีเฟรช
            </Button>
          </CardHeader>
          <CardBody className="overflow-auto">
            {!selectedEmployee ? (
              <div className="flex flex-col items-center justify-center h-full text-foreground/50 gap-2">
                <Users size={48} className="opacity-50" />
                <span>เลือกพนักงานเพื่อจัดการ Permissions</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <div key={module} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 border-b border-foreground/10 pb-2">
                      <Checkbox
                        isSelected={isModuleAllSelected(perms)}
                        isIndeterminate={isModuleSomeSelected(perms)}
                        onValueChange={() => handleSelectAllModule(perms)}
                        size="sm"
                      />
                      <span className="font-semibold uppercase text-foreground/70">
                        {module}
                      </span>
                      <Chip size="sm" variant="flat">
                        {
                          perms.filter((p) => checkedPermIds.includes(p.permId))
                            .length
                        }
                        /{perms.length}
                      </Chip>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 pl-2">
                      {perms.map((perm) => {
                        const isChecked = checkedPermIds.includes(perm.permId);
                        const wasOriginal = originalPermIds.includes(
                          perm.permId
                        );
                        const isAdded = isChecked && !wasOriginal;
                        const isRemoved = !isChecked && wasOriginal;

                        return (
                          <Checkbox
                            key={perm.permId}
                            isSelected={isChecked}
                            onValueChange={() =>
                              handlePermissionToggle(perm.permId)
                            }
                            size="sm"
                            classNames={{
                              base: `p-2 rounded-lg transition-colors ${
                                isAdded
                                  ? "bg-success/10 border border-success/30"
                                  : isRemoved
                                  ? "bg-danger/10 border border-danger/30"
                                  : "hover:bg-foreground/5"
                              }`,
                              label: "w-full",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm ${
                                  isAdded
                                    ? "text-success font-medium"
                                    : isRemoved
                                    ? "text-danger line-through"
                                    : ""
                                }`}
                              >
                                {getPermissionLabel(perm.permName)}
                              </span>
                              {perm.permName === "superAdmin" && (
                                <Chip size="sm" color="danger" variant="flat">
                                  Admin
                                </Chip>
                              )}
                              {perm.permName.endsWith(".*") && (
                                <Chip size="sm" color="warning" variant="flat">
                                  *
                                </Chip>
                              )}
                            </div>
                          </Checkbox>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </ModulePage>
  );
}
