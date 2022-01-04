import { writable } from "svelte/store";
import supabase from "./db";

export const user = writable(supabase.auth.user());
