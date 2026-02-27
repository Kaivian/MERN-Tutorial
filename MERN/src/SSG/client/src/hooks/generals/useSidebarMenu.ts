import { useMemo, useCallback } from "react";
import { useAuth } from "@/providers/auth.provider";
import { getSidebarSections, getSidebarSections2, SidebarItem } from "@/components/sidebar/SidebarData";
import { useTranslation } from "@/i18n";

export const useSidebarMenu = () => {
  const { checkAllPermissions, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  // FIX: Wrap processItems in useCallback to stabilize the function reference
  const processItems = useCallback((items: SidebarItem[]): SidebarItem[] => {
    return items.map((item) => {
      // 2. Check permissions if required
      if (item.requiredPerms && item.requiredPerms.length > 0) {
        // Hide if not authenticated
        if (!isAuthenticated) return { ...item, isHidden: true };

        // Check specific permissions
        const hasAccess = checkAllPermissions(item.requiredPerms);
        return { ...item, isHidden: !hasAccess };
      }

      // 3. Default case: Show item
      return item;
    });
  }, [isAuthenticated, checkAllPermissions]);

  // Now the dependencies are correct: [processItems]
  // Since processItems depends on [isAuthenticated, checkAllPermissions], this chain is reactive.
  const menuGroup1 = useMemo(() => {
    return getSidebarSections(t).map(section => ({
      ...section,
      items: processItems(section.items)
    }));
  }, [processItems, t]);

  const menuGroup2 = useMemo(() => {
    return getSidebarSections2(t).map(section => ({
      ...section,
      items: processItems(section.items)
    }));
  }, [processItems, t]);

  return {
    menuGroup1,
    menuGroup2
  };
};
