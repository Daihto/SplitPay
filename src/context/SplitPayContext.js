import React, { createContext, useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

export const SplitPayContext = createContext(null);

const STORAGE_KEY = "splitpay_app_state_v1";

const generateId = () => Math.random().toString(36).slice(2, 10);

const nowIso = () => new Date().toISOString();

const initialState = {
  user: null, // will be { id, username, email }
  groups: [],
  expenses: [],
  activities: [],
};

export function SplitPayProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState;
      const parsed = JSON.parse(raw);
      return { ...initialState, ...parsed };
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore in case storage is unavailable
    }
  }, [state]);

  const loadUserDataFromSupabase = async (userId) => {
    if (!userId) return null;

    try {
      // 1) Find all group IDs this user belongs to
      const { data: memberships, error: memErr } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);

      if (memErr) throw memErr;

      const groupIds = (memberships || []).map((m) => m.group_id);

      // 2) Load the groups
      let groups = [];
      if (groupIds.length > 0) {
        const { data: groupRows, error: groupErr } = await supabase
          .from("groups")
          .select("id, name, created_at")
          .in("id", groupIds);

        if (groupErr) throw groupErr;

        // load members for each group
        groups = await Promise.all(
          (groupRows || []).map(async (g) => {
            const { data: members, error: membersErr } = await supabase
              .from("group_members")
              .select("user_id, profiles(username)")
              .eq("group_id", g.id);

            if (membersErr) throw membersErr;

            return {
              id: g.id,
              name: g.name,
              members: (members || []).map((m) => m.profiles?.username || m.user_id),
              createdAt: g.created_at,
            };
          })
        );
      }

      // 3) Load expenses for those groups
      let expenses = [];
      if (groupIds.length > 0) {
        const { data: expenseRows, error: expErr } = await supabase
          .from("expenses")
          .select("*, profiles(username)")
          .in("group_id", groupIds)
          .order("date", { ascending: false });

        if (expErr) throw expErr;

        expenses = (expenseRows || []).map((e) => ({
          ...e,
          paidBy: e.profiles?.username || e.paid_by,
          splitAmong: e.split_among || [],
          isSettled: Boolean(e.is_settled),
          isSettlement: Boolean(e.is_settlement),
        }));
      }

      // 4) Load activities for this user
      const { data: activityRows, error: actErr } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (actErr) throw actErr;

      const activities = (activityRows || []).map((a) => ({
        id: a.id,
        message: a.message,
        date: a.date,
      }));

      return { groups, expenses, activities };
    } catch (err) {
      console.error("Failed to load data from Supabase", err);
      return null;
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username, email")
          .eq("id", userId)
          .single();

        if (error || !profile) {
          console.error("Profile not found", error);
          setState((prev) => ({ ...prev, user: null }));
          return;
        }

        const user = {
          id: userId,
          username: profile.username,
          email: profile.email,
        };

        const data = await loadUserDataFromSupabase(userId);
        setState((prev) => ({
          ...prev,
          user,
          ...(data ?? {}),
        }));
      } else if (event === 'SIGNED_OUT') {
        setState(initialState);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const _addActivity = async (message) => {
    const activity = {
      id: generateId(),
      user_id: state.user.id,
      message,
      date: nowIso(),
    };

    const { error } = await supabase.from("activities").insert([activity]);
    if (error) {
      console.error("Failed to save activity to Supabase", error);
    }

    setState((prev) => ({
      ...prev,
      activities: [activity, ...prev.activities].slice(0, 50),
    }));
  };

  const login = async (usernameOrEmail, password) => {
    // Login is handled by auth.js, but we can trigger it here if needed
    // Actually, since auth.js handles it, and onAuthStateChange will update state
  };

  const logout = async () => {
    await supabase.auth.signOut();
    _addActivity(`Logged out`);
    setState((prev) => ({ ...prev, user: null }));
  };

  const register = async (username, email, password) => {
    // Registration is handled by auth.js, but we can trigger it here if needed
    // onAuthStateChange will handle setting the user
  };

  const createGroup = async (name) => {
    const groupId = generateId();
    const trimmedName = name.trim();

    // Persist group record
    const { error: groupErr } = await supabase.from("groups").insert([
      {
        id: groupId,
        name: trimmedName,
        created_by: state.user.id,
        created_at: nowIso(),
      },
    ]);

    if (groupErr) {
      console.error("Failed to create group in Supabase", groupErr);
      return null;
    }

    // Persist membership
    const { error: membershipErr } = await supabase.from("group_members").insert([
      { group_id: groupId, user_id: state.user.id },
    ]);

    if (membershipErr) {
      console.error("Failed to add membership in Supabase", membershipErr);
    }

    const group = {
      id: groupId,
      name: trimmedName,
      members: [state.user.username],
      createdAt: nowIso(),
    };

    _addActivity(`Created group "${group.name}"`);

    setState((prev) => ({
      ...prev,
      groups: [group, ...prev.groups],
    }));

    return group;
  };

  const joinGroup = async (groupId) => {
    // Find group in local state first, otherwise fetch from Supabase
    const existing = state.groups.find((g) => g.id === groupId);

    const group =
      existing ||
      (await (async () => {
        const { data: groupRows, error: groupErr } = await supabase
          .from("groups")
          .select("id, name")
          .eq("id", groupId)
          .single();

        if (groupErr || !groupRows) return null;

        const { data: members, error: membersErr } = await supabase
          .from("group_members")
          .select("user_id, profiles(username)")
          .eq("group_id", groupId);

        if (membersErr) return null;

        return {
          id: groupRows.id,
          name: groupRows.name,
          members: (members || []).map((m) => m.profiles?.username || m.user_id),
          createdAt: groupRows.created_at,
        };
      })());

    if (!group) {
      return false;
    }

    // Add membership record (idempotent)
    const { error: membershipErr } = await supabase.from("group_members").upsert([
      { group_id: groupId, user_id: state.user.id },
    ]);

    if (membershipErr) {
      console.error("Failed to join group in Supabase", membershipErr);
    }

    const updatedGroup = {
      ...group,
      members: Array.from(new Set([...(group.members || []), state.user.username])),
    };

    _addActivity(`Joined group "${updatedGroup.name}"`);

    setState((prev) => {
      const groups = prev.groups.some((g) => g.id === groupId)
        ? prev.groups.map((g) => (g.id === groupId ? updatedGroup : g))
        : [updatedGroup, ...prev.groups];

      return {
        ...prev,
        groups,
      };
    });

    return true;
  };

  const addExpense = async ({ groupId, description, amount, paidBy, splitAmong }) => {
    const expenseId = generateId();
    const now = nowIso();

    const payload = {
      id: expenseId,
      group_id: groupId,
      description: description.trim(),
      amount: Number(amount),
      paid_by: paidBy,
      split_among: splitAmong,
      date: now,
      is_settled: false,
      is_settlement: false,
    };

    const { error } = await supabase.from("expenses").insert([payload]);
    if (error) {
      console.error("Failed to save expense to Supabase", error);
    }

    const expense = {
      id: expenseId,
      groupId,
      description: description.trim(),
      amount: Number(amount),
      paidBy,
      splitAmong,
      date: now,
      isSettled: false,
      isSettlement: false,
    };

    setState((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }));

    _addActivity(`Added expense “${description}” (${amount}) in group ${groupId}`);
    return expense;
  };

  const settleExpense = async (expenseId) => {
    const now = nowIso();

    const { error } = await supabase
      .from("expenses")
      .update({ is_settled: true, settled_at: now })
      .eq("id", expenseId);

    if (error) {
      console.error("Failed to update expense settlement in Supabase", error);
    }

    setState((prev) => {
      const expenses = prev.expenses.map((exp) => {
        if (exp.id !== expenseId) return exp;
        return {
          ...exp,
          isSettled: true,
          settledAt: now,
        };
      });

      const settled = prev.expenses.find((e) => e.id === expenseId);
      if (settled) {
        _addActivity(`Marked expense “${settled.description}” as settled`);
      }

      return { ...prev, expenses };
    });
  };

  const settleBalance = async (groupId, toUser, amount) => {
    const payer = state.user;
    const now = nowIso();

    const payload = {
      id: generateId(),
      group_id: groupId,
      description: `Settlement to ${toUser}`,
      amount: Number(amount),
      paid_by: payer,
      split_among: [payer, toUser],
      date: now,
      is_settlement: true,
      is_settled: true,
    };

    const { error } = await supabase.from("expenses").insert([payload]);
    if (error) {
      console.error("Failed to save settlement expense to Supabase", error);
    }

    _addActivity(`Settled ${amount} with ${toUser}`);

    setState((prev) => ({
      ...prev,
      expenses: [
        {
          id: payload.id,
          groupId,
          description: payload.description,
          amount: payload.amount,
          paidBy: payload.paid_by,
          splitAmong: payload.split_among,
          date: payload.date,
          isSettlement: true,
          isSettled: true,
        },
        ...prev.expenses,
      ],
    }));
  };

  const value = {
    ...state,
    login,
    logout,
    register,
    createGroup,
    joinGroup,
    addExpense,
    settleBalance,
    settleExpense,
  };

  return <SplitPayContext.Provider value={value}>{children}</SplitPayContext.Provider>;
}
