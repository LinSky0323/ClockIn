import { useEffect, useState,memo,useCallback } from "react"
import styles from "./DApplyList.module.css"
import { changeDate } from "../../lib/changeDate"
import { changeTime } from "../../lib/changeTime"
import { useChangeRemind } from "../../lib/useChangeRemind"
import { useFormState } from "react-dom"
import { SubmitButton } from "../Button/SubmitButton/SubmitButton"
import { APIURL } from "../../APIURL."


const Item = memo(({item,agree,disagree})=>{
    return(
        <tr>
            <td className={styles.td}>{item[0]}</td>
            <td className={styles.td}>{item[1]}</td>
            <td className={styles.td}>{changeDate(item[2])}</td>
            <td className={styles.td}>{item[3]===1?"上班":"下班"}</td>
            <td className={styles.td}>{changeTime(item[4])}</td>
            <td className={`${styles.td} ${styles.td1} ${(item[5]===1) && styles.a} ${(item[5]===2) && styles.d}`}>{item[5]===0?<div><button className={`${styles.button} ${styles.agree}`} onClick={()=>agree(item)}>同意</button><button className={`${styles.button} ${styles.disagree}`} onClick={()=>disagree(item)}>拒絕</button></div>
            :item[5]===1?"已同意":item[5]===2?"已拒絕":"異常"}</td>
        </tr>
    )
})

export function DApplyList(){
    const [loading,setLoading] = useState(false)
    const [list,setList] = useState(null)
    const [Sname,setSname] = useState("")
    const [Saccount,setSaccount] = useState("")
    const [Sdate,setSdate] = useState("")
    const [Stype,setStype] = useState("")
    const [Sstate,setSstate] = useState("")
    const remind = useChangeRemind()
    useEffect(()=>{
        getItem().then(setLoading(true))
    },[])
    
    const getItem = async()=>{
        const token = localStorage.getItem("token")
        const res = await fetch(APIURL+"searchApply",{
            method:"POST",
            headers:{
                "Content-type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({Sname,Saccount,Sdate,Stype,Sstate})
            })
        const data = await res.json()
        console.log(data)
        if(data.hasOwnProperty("no")){
            setList(null)
            setSname("")
            setSaccount("")
            setSdate("")
            setStype("")
            setSstate("")
            return
        }
        setList(data)
        setSname("")
        setSaccount("")
        setSdate("")
        setStype("")
        setSstate("")
    }

    const search = ()=>{
        getItem()
    }

    const agree =useCallback(async (e)=>{
        const token = localStorage.getItem("token")
        const res = await fetch(APIURL+"apply",{
            method:"PUT",
            headers:{
                "Content-type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({"id":e[6],"userID":e[7],"date":changeDate(e[2]),"ci":e[3],"time":e[4],"agree":1})
            })
        const data = await res.json()
        console.log(data)
        if(data.hasOwnProperty("ok")){
            setList((prvdata)=>prvdata.map(
            (item)=>item[6]===e[6]?[...item.slice(0, 5), 1, ...item.slice(6)]:item))
        }
    },[]) 
        
    const disagree =useCallback(async (e)=>{
        const token = localStorage.getItem("token")
        const res = await fetch(APIURL+"apply",{
            method:"PUT",
            headers:{
                "Content-type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({"id":e[6]})
            })
        const data = await res.json()
        if(data.hasOwnProperty("ok")){
            setList((prvdata)=>prvdata.map(
            (item)=>item[6]===e[6]?[...item.slice(0, 5), 2, ...item.slice(6)]:item))
        }
    },[]) 

    const [formstate,formaction] = useFormState(search,null)

    if(!loading){
        return
    }
    return(
        <section className={styles.container}>
            <form className={styles.form} action={formaction}>
                <div className={styles.title}>篩選項目:</div>
                <div className={styles.item}><label className={styles.label}>姓名：</label><input className={styles.input} type="text" value={Sname} onChange={(e)=>setSname(e.target.value)}></input></div>
                <div className={styles.item}><label className={styles.label}>工號：</label><input className={styles.input} type="text" value={Saccount} onChange={(e)=>setSaccount(e.target.value)}></input></div>
                <div className={styles.item}><label className={styles.label}>日期：</label><input className={styles.input} type="date" value={Sdate} onChange={(e)=>setSdate(e.target.value)}></input></div>
                <div className={styles.item}><label className={styles.label}>項目：</label><select className={styles.input} value={Stype}  onChange={(e)=>setStype(e.target.value)}>
                    <option></option>
                    <option value={1}>上班</option>
                    <option value={0}>下班</option>
                </select></div>
                <div className={styles.item}><label className={styles.label}>狀態：</label><select className={styles.input} value={Sstate}  onChange={(e)=>setSstate(e.target.value)}>
                    <option></option>
                    <option value={0}>未處理</option>
                    <option value={1}>已同意</option>
                    <option value={2}>已拒絕</option>
                </select></div>
                <div className={styles.btn}>
                    <SubmitButton name="篩選"/>
                    {remind.state && <div className={styles.remind}>{remind.state}</div>}
                </div>
            </form>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>姓名</th>
                        <th className={styles.th}>工號</th>
                        <th className={styles.th}>日期</th>
                        <th className={styles.th}>補打項目</th>
                        <th className={styles.th}>補打時間</th>
                        <th className={styles.th}>狀態欄</th>
                    </tr>
                </thead>
                <tbody>
                    {(list !== null && Object.keys(list).length) ? 
                    list.map((item)=>{
                        return(<Item item={item} key={item[6]} agree={agree} disagree={disagree}/>)
                    }):
                    null
                }
                </tbody>
            </table>    
        </section>
    )
}