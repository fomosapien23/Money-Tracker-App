import { create } from "zustand";
import { addCustomCategory, Category, deleteCustomCategory, getCategories, updateCustomCategory } from "../services/categoryService";


type CategoryStore = {
    expenseCategories: Category[];
    incomeCategories: Category[];
    loadCategories: ()=> void;
    addCategory: (name: string, type: 'income' | 'expense') => void
    updateCategory: (id:string, newName: string)=> void;
    deleteCategory: (id: string)=> void;
}

export const useCategoryStore = create<CategoryStore>((set, get)=>({
    expenseCategories: [],
    incomeCategories: [],

    loadCategories: ()=>
        set({
            expenseCategories: getCategories('expense'),
            incomeCategories: getCategories('income'),
        }),
        addCategory: (name, type)=>{
            addCustomCategory(name, type);
            set({
                expenseCategories: getCategories('expense'),
                incomeCategories: getCategories('income'),
            })
        },
        updateCategory: (id, newName) => {
            updateCustomCategory(id, newName);
            get().loadCategories();
        },

        deleteCategory: (id) => {
            deleteCustomCategory(id);
            get().loadCategories();
        },
        

}))