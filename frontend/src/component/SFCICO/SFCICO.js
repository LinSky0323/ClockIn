import { useEffect, useState,memo,useCallback } from "react"
import styles from "./SFCICO.module.css"
import { changeDate } from "../../lib/changeDate"
import { changeTime } from "../../lib/changeTime"
import { useChangeRemind } from "../../lib/useChangeRemind"
import { useFormState } from "react-dom"
import { SubmitButton } from "../Button/SubmitButton/SubmitButton"
import { APIURL } from "../../APIURL."


const Item = memo(({item})=>{
    const [ci,setCi] = useState(item[3]===null?"":changeTime(item[3]))
    const [co,setCo] = useState(item[4]===null?"":changeTime(item[4]))
    const [cif,setCif] = useState(false)
    const [cof,setCof] = useState(false)
    const remind = useChangeRemind()
    const formatTime = (value,i) => {
        // 移除非數字的字元
        value = value.replace(/\D/g, '');
        // 插入冒號以符合時間格式 XX:XX:XX
        if (value.length > 2 ) {
            value = value.slice(0, 2) + ':' + value.slice(2,4);
        }
        if(i===1){
            setCi(value);
        }
        else{
            setCo(value);
        }
    };
    const handleChange = (value,i) => {
        // 延遲格式化，確保輸入法完成後再處理
        setTimeout(() => {
            formatTime(value,i);
        }, 0);
    };
    const handleCI = ()=>{
        setCif(true)
    }
    const handleCO = ()=>{
        setCof(true)
    }
    const handleBlurCI = ()=>{
        setCif(false)
    }
    const handleBlurCO = ()=>{
        setCof(false)
    }
    const handleClick = async()=>{
        const token = localStorage.getItem("token")
        const res = await fetch(APIURL+"fixData",{
            method:"PUT",
            headers:{
                "Content-type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({"id":item[5],ci,co})
            })
        const data = await res.json()
        if(data.hasOwnProperty("ok")){
            remind.setRemind("OK")
        }
        else if(data.hasOwnProperty("no")){
            remind.setRemind("NO")
        }
        else{
            remind.setRemind("error")
        }
    }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.target.blur()
        }
      };
    return(
        <tr>
            <td className={styles.td}>{item[0]}</td>
            <td className={styles.td}>{item[1]}</td>
            <td className={styles.td}>{changeDate(item[2])}</td>
            {cif?<td><input onKeyDown={handleKeyDown} onBlur={handleBlurCI} className={styles.ininput} type="text" value={ci} onChange={(e)=>handleChange(e.target.value,1)} inputMode="numeric" /></td>:<td className={styles.td} onDoubleClick={handleCI}>{ci===""?"未打卡":ci}</td>}
            {cof?<td><input onKeyDown={handleKeyDown} onBlur={handleBlurCO} className={styles.ininput} type="text" value={co} onChange={(e)=>handleChange(e.target.value,2)} inputMode="numeric" /></td>:<td className={styles.td} onDoubleClick={handleCO}>{co===""?"未打卡":co}</td>}
            <td className={`${styles.td} `}>{(changeTime(item[3])===ci && changeTime(item[4])===co)?"":
                <div style={{display:"flex",justifyContent:"center"}}>
                    <button className={styles.button} onClick={handleClick}>修改</button>
                    {remind.state && <div className={styles.remind}>{remind.state}</div>}
                </div>}</td>
        </tr>
    )
})

export function SFCICO(){
    const [list,setList] = useState(null)
    const [Sname,setSname] = useState("")
    const [Saccount,setSaccount] = useState("")
    const [Sdate,setSdate] = useState("")
    const [Sdep,setSdep] = useState("")

    const remind = useChangeRemind()

    const search = async()=>{
        if(!Sname && !Saccount && !Sdate &&!Sdep){
            remind.setRemind("最少須輸入一個查詢條件")
            return
        }
        const token = localStorage.getItem("token")
        const res = await fetch(APIURL+"searchData",{
            method:"POST",
            headers:{
                "Content-type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({"name":Sname,"account":Saccount,"date":Sdate,"department":Sdep})
            })
        const data = await res.json()
        if(data.hasOwnProperty("ok")){
            setList(data["ok"])
            setSname("")
            setSaccount("")
            setSdate("")
            setSdep("")
        }
        else if(data.hasOwnProperty("no")){
            remind.setRemind(data["no"])
        }
        else{
            remind.setRemind("未知的錯誤")
        }
    }

    const [formstate,formaction] = useFormState(search,null)
    return(
        <section className={styles.container}>
            <form className={styles.form} action={formaction}>
                <div className={styles.title}>篩選項目:</div>
                <div className={styles.item}><label className={styles.label}>姓名：</label><input className={styles.input} type="text" value={Sname} onChange={(e)=>setSname(e.target.value)}></input></div>
                <div className={styles.item}><label className={styles.label}>工號：</label><input className={styles.input} type="text" value={Saccount} onChange={(e)=>setSaccount(e.target.value)}></input></div>
                <div className={styles.item}><label className={styles.label}>部門：</label><input className={styles.input} type="text" value={Sdep} onChange={(e)=>setSdep(e.target.value)} placeholder="輸入部門代碼"></input></div>
                <div className={styles.item}><label className={styles.label}>日期：</label><input className={styles.input} type="date" value={Sdate} onChange={(e)=>setSdate(e.target.value)}></input></div>
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
                        <th className={styles.th}>上班</th>
                        <th className={styles.th}>下班</th>
                        <th className={styles.th}></th>
                    </tr>
                </thead>
                <tbody>
                    {(list !== null && Object.keys(list).length) ? 
                    list.map((item)=>{
                        return(<Item item={item} key={item[5]} />)
                    }):
                    null
                }
                </tbody>
            </table>    
        </section>
    )
}