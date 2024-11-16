import { useEffect} from "react"
import styles from "./TodayTime.module.css"
import { changeTime } from "../../lib/changeTime"
import { useAuth } from "../../AuthContext"
import { APIURL } from "../../APIURL."

export function TodayTime(){
    const token = localStorage.getItem("token")
    const {intime,outtime,setIntime,setOuttime,timeloading,setTimeloading} = useAuth()


    useEffect(()=>{
        async function getmytime(){
            const res = await fetch(APIURL+"searchBySelf",{
                method:"GET",
                headers:{
                  "Content-type":"application/json",
                  "Authorization":`Bearer ${token}`
                }
              })
            const data = await res.json()
            if(data[3]){
                setIntime(changeTime(data[3]))
            }
            if(data[4]){
                setOuttime(changeTime(data[4]))
            }
            setTimeloading(true)
        }
        getmytime() 

    },[setIntime,setOuttime,setTimeloading,token])


    if(!timeloading){
        return
    }
    return(
    <>
    {(!intime && !outtime) && <div className={styles.noclock}>今日尚未打卡</div>}
    {(intime || outtime) && 
    <div className={styles.container}>
        <div className={styles.item}>{intime?
            <><div className={styles.title}>今日上班時間</div><div className={styles.time}>{intime}</div></>:<div className={styles.title}>尚未打上班卡</div>}
        </div>
        <div className={styles.item}>{outtime? 
            <><div className={styles.title}>今日下班時間</div><div className={styles.time}>{outtime}</div></>:<div className={styles.title}>尚未打下班卡</div>}
        </div>       
    </div>}
    </>
    )
}
