
import { Transaction } from "../services/localTransactions";

export const getMonthlyStats = (transactions : Transaction[]) =>{

    const monthly: Record<string, {income: number; expense:number}>={}

    transactions.forEach((t)=>{
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`

        if(!monthly[key]){
            monthly[key]={income:0,expense:0}
        }

        if(t.type==='income') monthly[key].income += t.amount
        else monthly[key].expense += t.amount
    })

    const sortedKeys = Object.keys(monthly).sort();

    return {
        labels : sortedKeys.map((k) => {
            const [year, month] = k.split('-')
            return new Date(Number(year), Number(month)).toLocaleString('default', {
                month: 'short'
            })
        }),
        incomeData: sortedKeys.map((k) => monthly[k].income),
        expenseData: sortedKeys.map((k) => monthly[k].expense)
    }
}