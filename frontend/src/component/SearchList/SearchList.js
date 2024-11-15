import { useEffect, useState } from "react"
import styles from "./SearchList.module.css"
import { changeDate } from "../../lib/changeDate"
import { changeTime } from "../../lib/changeTime"
import { useFormState } from "react-dom"
import { SubmitButton } from "../Button/SubmitButton/SubmitButton"
export function SearchList(){
    const [loading,setLoading] = useState(false)
    const [list,setList] = useState(null)
    const today = new Date()
    const year = today.getFullYear()
    const month =today.getMonth()+1
    const day = today.getDate()
    const [date,setDate] = useState(`${year}-${month}-${day}`)

    useEffect(()=>{
        const getTIme = async()=>{
            const token = localStorage.getItem("token")
            const res = await fetch("http://localhost:5000/searchBySelf",{
                method:"POST",
                headers:{
                  "Content-type":"application/json",
                  "Authorization":`Bearer ${token}`
                },
                body:JSON.stringify({year,month})
              })
            const data = await res.json()
            setList(data)
        }
        getTIme().then(setLoading(true))
    },[])
    const search = async ()=>{
        const [y, m, d] = date.split("-");
        const token = localStorage.getItem("token")
            const res = await fetch("http://localhost:5000/searchBySelf",{
                method:"POST",
                headers:{
                  "Content-type":"application/json",
                  "Authorization":`Bearer ${token}`
                },
                body:JSON.stringify({"year":y,"month":m,"day":d})
              })
            const data = await res.json()
            setList(data)

    }
    const [formstate,formaction] = useFormState(search,null)

    if(!loading){
        return
    }
    return(
        <section className={styles.container}>
            <form action={formaction} className={styles.form}>
                <label className={styles.label}>選擇日期</label><input type="date" value={date} onChange={(e)=>setDate(e.target.value)}></input>
                <div className={styles.btn}>
                    <SubmitButton name="查詢"/>
                </div>
            </form>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>日期</th>
                        <th className={styles.th}>上班時間</th>
                        <th className={styles.th}>下班時間</th>
                    </tr>
                </thead>
                <tbody>
                    {(list !== null && Object.keys(list).length) ? 
                    list.map((item)=>{
                        return(<tr key={item[2]}>
                            <td className={styles.td}>{changeDate(item[2])}</td>
                            <td className={styles.td}>{item[3]?changeTime(item[3]):"未打卡"}</td>
                            <td className={styles.td}>{item[4]?changeTime(item[4]):"未打卡"}</td>
                        </tr>)
                    }):
                    null
                }
                </tbody>
            </table>    
        </section>
    )
}