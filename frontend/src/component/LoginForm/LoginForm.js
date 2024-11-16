import { SubmitButton } from "../Button/SubmitButton/SubmitButton"
import styles from "./LoginForm.module.css"
import { useFormState } from "react-dom"
import { useState } from "react"
import { useChangeRemind } from "../../lib/useChangeRemind"
import { useAuth } from "../../AuthContext"
import { APIURL } from "../../APIURL."

export function LoginForm() {
    
    //取得context中的使用者資料
    const {login} = useAuth()
    //帳秘輸入框
    const [account,setAccount] = useState("")   
    const [password,setPassword] = useState("")
    //登入邏輯
    const loggin = async(prevState, formData)=>{
        const account = formData.get("account")
        const password = formData.get("password")
        const regex = /^[A-Za-z0-9]+$/;
        if(!account){
            remind.setRemind("帳號不能為空")
            return
        }
        if(!password){
            remind.setRemind("密碼不能為空")
            return
        }
        if(!regex.test(account)){
            remind.setRemind("只能輸入英文或數字")
            return
        }
        if(!regex.test(password)){
            remind.setRemind("只能輸入英文或數字")
            return
        }
        const result = await fetch(APIURL+"user",{
            method:"PUT",
            headers:{"Content-type":"application/json"},
            body:JSON.stringify({account,password})
        })
        const data = await result.json()
        if(data.hasOwnProperty("no")){
            remind.setRemind("輸入錯誤的帳號或密碼")
            return
        }
        login(data.name,data.department,data.access)
        localStorage.setItem("token",data.token)
    }
    //提示訊息
    const remind = useChangeRemind()
    //表單狀態
    const [formstate,formaction] = useFormState(loggin,null)
    return (
      <form className={styles.form} action={formaction}>
        <div className={styles.inf}>
            <label>帳號: </label><input className={styles.input} type="text" value={account} onChange={(e)=>setAccount(e.target.value)} name="account" placeholder="工號"></input>
        </div>
        <div className={styles.inf}>
            <label>密碼: </label><input className={styles.input} type="password" value={password} onChange={(e)=>setPassword(e.target.value)} name="password" placeholder="身分證字號or居留證號碼"></input>
        </div>
        <div className={styles.btn}>
            {remind.state && <div className={styles.remind}>{remind.state}</div>}
            <SubmitButton name="登入"/>
        </div>
      </form>
    );
  }