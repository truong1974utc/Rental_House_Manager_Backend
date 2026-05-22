export const CHAT_ACCESS_DENIED_MESSAGE = "Bạn chưa được gán phòng nên không thể tham gia nhóm chat.";

const MANAGER_ROLES = new Set(["manager", "admin", "ADMIN"]);

type ChatAccessTenant = {
    role?: string | null;
    roomId?: unknown;
};

export const isManagerRole = (role?: string | null) => {
    return Boolean(role && MANAGER_ROLES.has(role));
};

export const hasChatAccess = (tenant?: ChatAccessTenant | null) => {
    if (!tenant) return false;
    return isManagerRole(tenant.role) || Boolean(tenant.roomId);
};
