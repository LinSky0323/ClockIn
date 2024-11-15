import styles from "./ClockInForm.module.css"
import { useFormState,useFormStatus } from "react-dom"
import { useChangeRemind } from "../../lib/useChangeRemind"
import { useAuth } from "../../AuthContext"



export function ClockInForm(){

    const {setIntime,setOuttime,timeloading} = useAuth()

    const clockin = async()=>{


        const success = async (position)=>{
            const lat = position.coords.latitude
            const lon = position.coords.longitude
            if(24.963676>lat>24.959772 && 121.143185>lon>121.137934){
                const token = localStorage.getItem("token")
                const res = await fetch("http://localhost:5000/time",{
                    method:"POST",
                    headers:{
                      "Content-type":"application/json",
                      "Authorization":`Bearer ${token}`
                    }
                  })
                const data = await res.json()
                if(data.hasOwnProperty("no")){
                    remind.setRemind(data["no"])
                }
                else if(data.hasOwnProperty("CI")){
                    remind.setRemind(`${data["ok"]}:${data["CI"]}`)
                    setIntime(data["CI"])
                }
                else if(data.hasOwnProperty("CO")){
                    remind.setRemind(`${data["ok"]}:${data["CO"]}`)
                    setOuttime(data["CO"])
                }
                else{
                    remind.setRemind("未知的錯誤")
                }
            }
            else{
                remind.setRemind("您不在公司範圍內")
            }
        }
        const error = ()=>{
            console.log("無法取得定位")
        }
        navigator.geolocation.getCurrentPosition(success,error)


        // const token = localStorage.getItem("token")
        // const res = await fetch("http://localhost:5000/time",{
        //     method:"POST",
        //     headers:{
        //       "Content-type":"application/json",
        //       "Authorization":`Bearer ${token}`
        //     }
        //   })
        // const data = await res.json()
        // if(data.hasOwnProperty("no")){
        //     remind.setRemind(data["no"])
        // }
        // else if(data.hasOwnProperty("CI")){
        //     remind.setRemind(`${data["ok"]}:${data["CI"]}`)
        //     setIntime(data["CI"])
        // }
        // else if(data.hasOwnProperty("CO")){
        //     remind.setRemind(`${data["ok"]}:${data["CO"]}`)
        //     setOuttime(data["CO"])
        // }
        // else{
        //     remind.setRemind("未知的錯誤")
        // }
    }
    //表單狀態
    const {pending} = useFormStatus()
     //提示訊息
    const remind = useChangeRemind()
     //表單狀態
    const [formstate,formaction] = useFormState(clockin,null)

    if(!timeloading){
        return
    }
    return(
        <>
            <form className={styles.form} action={formaction}>
                <button type="submit" disabled={pending} className={styles.button}>
                    {pending?"...":"打卡"}
                </button>
                {remind.state && <div className={styles.remind}>{remind.state}</div>}
            </form>
        </>
    )
}