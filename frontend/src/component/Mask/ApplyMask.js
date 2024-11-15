import { useAuth } from "../../AuthContext"
import { StopPropogation } from "../../lib/stopPropagation"
import { useChangeRemind } from "../../lib/useChangeRemind"
import styles from "./ApplyMask.module.css"

export function ApplyMask({date,time,CI,setMask}){
    const {setState} = useAuth()
    const remind = useChangeRemind()
    const handleClick = ()=>{
        setMask(false)
    }
    const submit = async()=>{
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5000/apply",{
            method:"POST",
            headers:{
              "Content-type":"application/json",
              "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({date,time,CI})
          })
        const data = await res.json()
        if(data.hasOwnProperty("ok")){
            remind.setRemind(data["ok"])
            setTimeout(() => {
                setMask(false)
                setState(0)
            }, 2000);
        }
        else{
            remind.setRemind(data["no"])
        }
    }
    return(
        <div className={styles.mask} onClick={handleClick}>
            <div className={styles.container} onClick={StopPropogation}>
                <div className={styles.title}style={{marginTop:"10px"}}>{`您想在 ${date} 的 ${time} 申請 ${CI === true?"上班":"下班"} 補打卡嗎?`}</div>
                <div style={{display:"flex",flexDirection:"column",marginTop:"10px",alignItems:"center"}}> 
                    <button className={styles.btn} onClick={submit}>確認送出</button>
                    {remind.state && <div className={styles.remind}>{remind.state}</div>}
                </div>
            </div>
        </div>
    )
}