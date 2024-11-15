import { useEffect, useState } from "react"
import styles from "./SearchApply.module.css"
import { changeDate } from "../../lib/changeDate"
import { changeTime } from "../../lib/changeTime"
export function SearchApply(){
    const [loading,setLoading] = useState(false)
    const [list,setList] = useState(null)

    useEffect(()=>{
        const getApply = async()=>{
            const token = localStorage.getItem("token")
            const res = await fetch("http://localhost:5000/searchApply",{
                method:"GET",
                headers:{
                  "Content-type":"application/json",
                  "Authorization":`Bearer ${token}`
                },
              })
            const data = await res.json()
            setList(data)
        }
        getApply().then(setLoading(true))
    },[])
    
    if(!loading){
        return
    }
    return(
        <section className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>日期</th>
                        <th className={styles.th}>打卡種類</th>
                        <th className={styles.th}>打卡時間</th>
                        <th className={styles.th}>申請狀態</th>
                    </tr>
                </thead>
                <tbody>
                   
                    {(list !== null ) ? 
                    list.map((item)=>{
                        return(<tr key={item[3]}>
                            <td className={styles.td}>{changeDate(item[3])}</td>
                            <td className={styles.td}>{item[4]===1?"上班":"下班"}</td>
                            <td className={styles.td}>{changeTime(item[5])}</td>
                            <td className={styles.td}>{item[6]===0?"未處理":item[6]===1?"同意":item[6]===2?"拒絕":"異常"}</td>
                        </tr>)
                    }):
                    null
                }
                </tbody>
            </table>    
        </section>
    )
}