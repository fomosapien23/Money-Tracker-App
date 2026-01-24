import { useTransactionStore } from "@/src/store/transactionStore";
import { Button, FlatList, Text, View } from "react-native";


export default function Home (){

  const {transactions, addTransaction, deleteTransaction} = useTransactionStore();

  return (
    <View style={{flex:1, padding:20}}>
      <Text style={{fontSize:24, fontWeight:'bold', marginBottom:20}}>Money Tracker</Text>

        <Button
        title="Add test expense"
        onPress={()=>
          addTransaction({
            title:'Burger',
            amount:234,
            type:"expense",
            category:"food",
          })
        }
        />

          <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <Text>{item.title} - {item.amount}</Text>
              <Button
                title="Delete"
                onPress={() => deleteTransaction(item.id)}
              />
            </View>
          )}
        />
    </View>
  )

  
}
