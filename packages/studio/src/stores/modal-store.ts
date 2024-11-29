import { create } from "zustand";
import { defaultModalValues } from "./default-values";

export const useStudioAuthStore = create<DefaultModal>(defaultModalValues);
