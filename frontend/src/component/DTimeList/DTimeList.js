import { useEffect, useState } from "react"
import styles from "./DTimeList.module.css"
import { changeDate } from "../../lib/changeDate"
import { changeTime } from "../../lib/changeTime"
import { useFormState } from "react-dom"
import { SubmitButton } from "../Button/SubmitButton/SubmitButton"
import { useChangeRemind } from "../../lib/useChangeRemind"
export function DTimeList(){
    const [loading,setLoading] = useState(false)
    const [list,setList] = useState(null)
    const [date,setDate] = useState("")
    const [condition,setCondition] = useState("")
    
    useEffect(()=>{
        const getTIme = async()=>{
            const token = localStorage.getItem("token")
            const res = await fetch("http://localhost:5000/searchByDepartment",{
                method:"GET",
                headers:{
                  "Content-type":"application/json",
                  "Authorization":`Bearer ${token}`
                },
              })
            const data = await res.json()
            setList(data)
        }
        getTIme().then(setLoading(true))
    },[])
    const search = async ()=>{
        const [y, m, d] = date.split("-");
        if(!date && !condition){
            remind.setRemind("請輸入查詢參數")
            return
        }
        let con = 0
        if(condition){
            if(/\d/.test(condition)){
                con = 1
            }
            else{
                con = 2
            }
        }
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5000/searchByDepartment",{
            method:"POST",
            headers:{
                "Content-type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({"year":y,"month":m,"day":d,[con === 1?"account":con === 2?"name":null]:condition})
            })
        const data = await res.json()
        if(data.hasOwnProperty("no")){
            remind.setRemind(data["no"])
            return
        }
        console.log(data)
        setList(data)

    }
    //提示訊息
    const remind = useChangeRemind()

    const [formstate,formaction] = useFormState(search,null)

    if(!loading){
        return
    }
    return(
        <section className={styles.container}>
            <form action={formaction} className={styles.form}>
                <label className={styles.label}>依照姓名或工號查詢</label><input type="text" value={condition} onChange={(e)=>setCondition(e.target.value)}></input>
                <label className={styles.label}>選擇日期</label><input type="date" value={date} onChange={(e)=>setDate(e.target.value)}></input>
                <div className={styles.btn}>
                    <SubmitButton name="查詢"/>
                    {remind.state && <div className={styles.remind}>{remind.state}</div>}
                </div>
            </form>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>姓名</th>
                        <th className={styles.th}>工號</th>
                        <th className={styles.th}>日期</th>
                        <th className={styles.th}>上班時間</th>
                        <th className={styles.th}>下班時間</th>
                    </tr>
                </thead>
                <tbody>
                    {(list !== null && Object.keys(list).length) ? 
                    list.map((item)=>{
                        return(<tr key={item[2]}>
                            <td className={styles.td}>{item[0]}</td>
                            <td className={styles.td}>{item[1]}</td>
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