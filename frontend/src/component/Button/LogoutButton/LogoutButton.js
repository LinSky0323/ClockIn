import { useAuth } from "../../../AuthContext"
import { SubmitButton } from "../SubmitButton/SubmitButton"
import styles from "./LogoutButton.module.css"
import { useFormState } from "react-dom"

export function LogoutButton(){
    const {logout} = useAuth()
    const loggout = ()=>{
        localStorage.removeItem("token")
        logout()
    }
     //表單狀態
     const [formstate,formaction] = useFormState(loggout,null)
    return(
        <form action={formaction} className={styles.btn}>
            <SubmitButton name="登出"/>
        </form>
    )
}