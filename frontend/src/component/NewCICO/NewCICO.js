import styles from "./NewCICO.module.css"
import { useChangeRemind } from "../../lib/useChangeRemind"
import { useFormState } from "react-dom"
import { SubmitButton } from "../Button/SubmitButton/SubmitButton"
import { useState } from "react"
import { APIURL } from "../../APIURL."

export function NewCICO(){
    const [account,setAccount] = useState("")
    const [date,setDate] = useState("")
    const [ci,setCi] = useState("08:00")
    const [co,setCo] = useState("17:20")


    const create = async()=>{
        if(!account || !date ){
            remind.setRemind("有欄位尚未輸入")
            return
        }
        const token = localStorage.getItem("token")
        const res = await fetch(APIURL+"fixData",{
            method:"POST",
            headers:{
                "Content-type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({account,date,ci,co})
            })
        const data = await res.json()
        console.log(data)
        if(data.hasOwnProperty("ok")){
            remind.setRemind(data["ok"])
            setAccount("")
            setDate("")
            setCi("08:00")
            setCo("17:20")
        }
        else if(data.hasOwnProperty("no")){
            remind.setRemind(data["no"])
        }
        else{
            remind.setRemind("未知的錯誤")
        }
    }
    const [formstate,formaction] = useFormState(create,null)
    const remind = useChangeRemind()
    return(
        <form className={styles.form} action={formaction}>
            <div className={styles.title}>新增打卡時間紀錄:</div>
            <div className={styles.item}><label className={styles.label}>工號：</label><input className={styles.input} type="text" value={account} onChange={(e)=>setAccount(e.target.value)}></input></div>
            <div className={styles.item}><label className={styles.label}>日期：</label><input className={styles.input} type="date" value={date} onChange={(e)=>setDate(e.target.value)}></input></div>
            <div className={styles.item}><label className={styles.label}>上班時間：</label><input className={styles.input} type="time" value={ci} onChange={(e)=>setCi(e.target.value)}></input></div>
            <div className={styles.item}><label className={styles.label}>下班時間：</label><input className={styles.input} type="time" value={co} onChange={(e)=>setCo(e.target.value)}></input></div>
            <div className={styles.btn}>
                <SubmitButton name="新增紀錄"/>
                {remind.state && <div className={styles.remind}>{remind.state}</div>}
            </div>
        </form>
    )
}