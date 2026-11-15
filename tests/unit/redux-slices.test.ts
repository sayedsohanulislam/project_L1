import { describe, it, expect } from "vitest";
import authReducer, { setCredentials, switchRole, logout } from "@/store/slices/authSlice";
import searchConfigReducer, {
  setQuery,
  addFilter,
  removeFilter,
  clearFilters,
  setPage,
  toggleColumnSort,
} from "@/store/slices/searchConfigSlice";
import uiPreferenceReducer, {
  setTableDensity,
  toggleColumnVisibility,
  toggleSelectRecord,
  clearSelection,
} from "@/store/slices/uiPreferenceSlice";

describe("Redux Toolkit Slices Unit Tests", () => {
  describe("authSlice", () => {
    it("should handle switchRole correctly", () => {
      const initialState = {
        user: { id: "1", name: "User", email: "user@test.com", role: "VIEWER" as const },
        token: "tok",
        isAuthenticated: true,
        isLoading: false,
      };

      const state = authReducer(initialState, switchRole("ADMIN"));
      expect(state.user?.role).toBe("ADMIN");
      expect(state.user?.email).toBe("admin@datascope.io");
    });

    it("should handle logout cleanly", () => {
      const state = authReducer(undefined, logout());
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("searchConfigSlice", () => {
    it("should add, update, and remove dynamic filter conditions", () => {
      let state = searchConfigReducer(undefined, { type: "@@INIT" });
      expect(state.filters).toHaveLength(0);

      state = searchConfigReducer(
        state,
        addFilter({ id: "f-1", field: "country", operator: "equals", value: "Germany" })
      );
      expect(state.filters).toHaveLength(1);
      expect(state.filters[0].value).toBe("Germany");

      state = searchConfigReducer(state, removeFilter("f-1"));
      expect(state.filters).toHaveLength(0);
    });

    it("should reset page to 1 when changing search query", () => {
      let state = searchConfigReducer(undefined, setPage(5));
      expect(state.page).toBe(5);

      state = searchConfigReducer(state, setQuery("New Search Term"));
      expect(state.query).toBe("New Search Term");
      expect(state.page).toBe(1);
    });

    it("should toggle single-column and multi-column sorting", () => {
      let state = searchConfigReducer(undefined, { type: "@@INIT" });
      state = searchConfigReducer(state, toggleColumnSort({ column: "revenue", multi: false }));
      expect(state.sorting[0]).toEqual({ column: "revenue", direction: "asc" });

      state = searchConfigReducer(state, toggleColumnSort({ column: "revenue", multi: false }));
      expect(state.sorting[0]).toEqual({ column: "revenue", direction: "desc" });
    });
  });

  describe("uiPreferenceSlice", () => {
    it("should toggle table density and column visibility", () => {
      let state = uiPreferenceReducer(undefined, setTableDensity("comfortable"));
      expect(state.tableDensity).toBe("comfortable");

      const initialStatusVis = state.visibleColumns.status;
      state = uiPreferenceReducer(state, toggleColumnVisibility("status"));
      expect(state.visibleColumns.status).toBe(!initialStatusVis);
    });

    it("should handle multi-row record selection", () => {
      let state = uiPreferenceReducer(undefined, toggleSelectRecord("rec-100"));
      expect(state.selectedRecordIds).toContain("rec-100");

      state = uiPreferenceReducer(state, toggleSelectRecord("rec-100"));
      expect(state.selectedRecordIds).not.toContain("rec-100");
    });
  });
});
