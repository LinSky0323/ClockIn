import styles from "./Account.module.css"
import { useChangeRemind } from "../../lib/useChangeRemind"
import { useFormState } from "react-dom"
import { SubmitButton } from "../Button/SubmitButton/SubmitButton"
import { useState } from "react"

export function Account(){
    const [name,setName] = useState("")
    const [account,setAccount] = useState("")
    const [password,setPassword] = useState("12345")
    const [department,setDepartment] = useState("")

    const create = async()=>{
        if(!name || !account || !password || !department){
            remind.setRemind("有欄位尚未輸入")
            return
        }
        if(!/\d/.test(department)){
            remind.setRemind("部門請輸入數字代碼")
            return
        }
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5000/user",{
            method:"POST",
            headers:{
                "Content-type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({name,account,password,department,})
            })
        const data = await res.json()
        if(data.hasOwnProperty("ok")){
            remind.setRemind(data["ok"])
            setName("")
            setAccount("")
            setPassword("12345")
            setDepartment("")
        }
        else if(data.hasOwnProperty("no")){
            remind.setRemind(data["no"])
        }
    }
    const [formstate,formaction] = useFormState(create,null)
    const remind = useChangeRemind()
    return(
        <form className={styles.form} action={formaction}>
            <div className={styles.title}>創建員工帳號:</div>
            <div className={styles.item}><label className={styles.label}>姓名：</label><input className={styles.input} type="text" value={name} onChange={(e)=>setName(e.target.value)}></input></div>
            <div className={styles.item}><label className={styles.label}>工號：</label><input className={styles.input} type="text" value={account} onChange={(e)=>setAccount(e.target.value)}></input></div>
            <div className={styles.item}><label className={styles.label}>密碼：</label><input className={styles.input} type="text" value={password} onChange={(e)=>setPassword(e.target.value)}></input></div>
            <div className={styles.item}><label className={styles.label}>部門：</label><input className={styles.input} type="text" value={department} onChange={(e)=>setDepartment(e.target.value)}></input></div>
            <div className={styles.btn}>
                <SubmitButton name="創建"/>
                {remind.state && <div className={styles.remind}>{remind.state}</div>}
            </div>
        </form>
    )
}