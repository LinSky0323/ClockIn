import styles from "./SubmitButton.module.css"
import { useFormStatus } from "react-dom"
export function SubmitButton({name}){
    const {pending} = useFormStatus()
    return(
           <button type="submit" disabled={pending} className={styles.button}>
            {pending?"...":name}
        </button>
    )
}