import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableLoading,
  TableEmpty,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Shield,
  UserX,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
  Filter,
  X,
} from "lucide-react";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import type { IAdmin, AdminRole } from "@/types/admin.types";
import type { PaginatedResponse, PaginationMeta, ApiResponse } from "@/types/api.types";

interface UserManagementProps {
  className?: string;
}

const ROLES: AdminRole[] = ["super_admin", "admin", "officer", "viewer"];
const ROLE_LABELS: Record<AdminRole, { en: string; am: string; color: string }> = {
  super_admin: { en: "Super Admin", am: "ዋና አስተዳዳሪ", color: "text-red-400" },
  admin: { en: "Admin", am: "አስተዳዳሪ", color: "text-purple-400" },
  officer: { en: "Officer", am: "ባለስልጣን", color: "text-blue-400" },
  viewer: { en: "Viewer", am: "ተመልካች", color: "text-gray-400" },
};

export function UserManagement({ className }: UserManagementProps) {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<IAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminRole | "">("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [language] = useState<"en" | "am">(storage.getLanguage());
  const currentUser = storage.getUser<IAdmin>();

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const queryString = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join("&");

      const response = await api.get<PaginatedResponse<IAdmin>>(`/admin?${queryString}`);
      if (response.data.success) {
        setAdmins(response.data.data);
        if (response.data.meta) setMeta(response.data.meta);
      }
    } catch (err) {
      console.error("Failed to fetch admins:", err);
      toast({ variant: "error", title: "Error", description: "Failed to load staff" });
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, toast]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleToggleStatus = async (admin: IAdmin) => {
    try {
      const response = await api.patch(`/admin/${admin._id}/toggle-status`);
      if (response.data.success) {
        setAdmins((prev) =>
          prev.map((a) => (a._id === admin._id ? { ...a, isActive: !a.isActive } : a))
        );
        toast({ variant: "success", title: language === "am" ? "ተሳክቷል" : "Success", description: `${admin.fullName} ${admin.isActive ? "deactivated" : "activated"}` });
      }
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err?.message });
    }
  };

  const handleCreateAdmin = async (data: any) => {
    try {
      await api.post("/admin", data);
      toast({ variant: "success", title: "Created", description: "Admin account created" });
      setCreateModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err?.message });
    }
  };

  const getUserInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const columns = 7;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={language === "am" ? "በስም ወይም ኢሜይል ፈልግ..." : "Search by name or email..."}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 h-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v as AdminRole | ""); setPage(1); }}>
            <SelectTrigger className="w-[140px] h-9">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={language === "am" ? "ሚና" : "Role"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{language === "am" ? "ሁሉም" : "All Roles"}</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  <span className={ROLE_LABELS[r]?.color}>{language === "am" ? ROLE_LABELS[r]?.am : ROLE_LABELS[r]?.en}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="glass" size="sm" onClick={fetchAdmins} disabled={loading} className="gap-1.5">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            {language === "am" ? "አድስ" : "Refresh"}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {language === "am" ? "አዲስ" : "Add Admin"}
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table containerClassName="rounded-xl border border-border/20">
        <TableHeader>
          <TableRow>
            <TableHead>{language === "am" ? "ስም" : "Name"}</TableHead>
            <TableHead>{language === "am" ? "ኢሜይል / ስልክ" : "Email / Phone"}</TableHead>
            <TableHead>{language === "am" ? "ሚና" : "Role"}</TableHead>
            <TableHead>{language === "am" ? "ክፍል" : "Department"}</TableHead>
            <TableHead>{language === "am" ? "ሁኔታ" : "Status"}</TableHead>
            <TableHead>{language === "am" ? "የመጨረሻ መግቢያ" : "Last Login"}</TableHead>
            <TableHead className="w-[50px]">{language === "am" ? "ተግባር" : "Action"}</TableHead>
          </TableRow>
        </TableHeader>
        {loading ? (
          <TableLoading columns={columns} rows={6} />
        ) : admins.length === 0 ? (
          <TableEmpty columns={columns} title={language === "am" ? "ምንም ሰራተኞች አልተገኙም" : "No staff found"} />
        ) : (
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin._id} hover>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {getUserInitials(admin.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{admin.fullName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{admin.phoneNumber}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" size="sm" className={ROLE_LABELS[admin.role]?.color}>
                    {language === "am" ? ROLE_LABELS[admin.role]?.am : ROLE_LABELS[admin.role]?.en}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm truncate max-w-[120px]">{admin.department}</TableCell>
                <TableCell>
                  <Switch
                    checked={admin.isActive}
                    onCheckedChange={() => handleToggleStatus(admin)}
                    disabled={admin._id === currentUser?._id}
                  />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {}} className="gap-2">
                        <Edit className="h-4 w-4" />
                        {language === "am" ? "አስተካክል" : "Edit"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(admin)} className="gap-2">
                        {admin.isActive ? <UserX className="h-4 w-4 text-red-400" /> : <UserCheck className="h-4 w-4 text-emerald-400" />}
                        {admin.isActive ? (language === "am" ? "አቦዝን" : "Deactivate") : (language === "am" ? "አንቃ" : "Activate")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {meta && meta.totalPages > 1 && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

      {/* Create Admin Modal */}
      <CreateAdminModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateAdmin}
        language={language}
      />
    </div>
  );
}

function CreateAdminModal({
  open,
  onClose,
  onSubmit,
  language,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  language: "en" | "am";
}) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "officer" as AdminRole,
    department: "",
    position: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(form);
      setForm({ fullName: "", email: "", phoneNumber: "", password: "", role: "officer", department: "", position: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{language === "am" ? "አዲስ አስተዳዳሪ ይፍጠሩ" : "Create Admin"}</DialogTitle>
          <DialogDescription>{language === "am" ? "አዲስ ሰራተኛ መለያ ይፍጠሩ" : "Create a new staff account"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input label={language === "am" ? "ሙሉ ስም" : "Full Name"} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label={language === "am" ? "ስልክ" : "Phone"} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          <Input label={language === "am" ? "የይለፍ ቃል" : "Password"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AdminRole })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input label={language === "am" ? "ክፍል" : "Department"} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <Input label={language === "am" ? "ማዕረግ" : "Position"} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{language === "am" ? "ይቅር" : "Cancel"}</Button>
          <Button onClick={handleSubmit} loading={loading}>{language === "am" ? "ፍጠር" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserManagement;