import { useState } from "react"
import { SubmitButton } from "../Button/SubmitButton/SubmitButton"
import styles from "./ApplyForm.module.css"
import { useChangeRemind } from "../../lib/useChangeRemind"
import { useFormState } from "react-dom"
import { useAuth } from "../../AuthContext"
import { ApplyMask } from "../Mask/ApplyMask"


export function ApplyForm(){
    const [mask,setMask] = useState(false)
    const today = new Date()
    const y = today.getFullYear()
    const m = today.getMonth()+1
    const d = today.getDate()
    // 獲取小時、分鐘和秒數，並加上零填充
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');

    // 組合為 HH:mm:ss 格式
    const timeString = `${hours}:${minutes}`;

    const [CI,setCI] = useState(true)
    const [date,setDate] = useState(`${y}-${m}-${d}`)
    const [time,setTime] = useState(timeString)

    const {state} = useAuth()

    const apply = (prevState, formData)=>{
        setMask(true)
    }
    const handleClickT = ()=>{
        setCI(true)
    }
    const handleClickF = ()=>{
        setCI(false)
    }
    //提示訊息
    const remind = useChangeRemind()
    //表單狀態
    const [formstate,formaction] = useFormState(apply,null)

        return(
            <>
            {mask && <ApplyMask date={date} time={time} CI={CI} setMask={setMask}/>}
            
            <form action={formaction} className={styles.form}>
               <label className={styles.label}>補打日期</label><input type="date" value={date} onChange={(e)=>setDate(e.target.value)}></input>
               <label className={styles.label}>補打時間</label><input type="time" value={time} onChange={(e)=>setTime(e.target.value)}></input>
               <div className={styles.container}>
                    <div onClick={handleClickT} className={`${styles.item} ${(CI === true) && styles.high}`}>上班</div>
                    <div onClick={handleClickF} className={`${styles.item} ${(CI === false) && styles.high}`}>下班</div>
               </div>
               <div className={styles.btn}>
                <SubmitButton name="送出申請"/>
                {remind.state && <div className={styles.remind}>{remind.state}</div>}
            </div>
            </form>
            </>
        )

}