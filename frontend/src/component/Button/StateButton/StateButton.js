import { useAuth } from "../../../AuthContext"
import styles from "./StateButton.module.css"

export function StateButton({statelist}){
    const {state,setState} = useAuth()
    const handleClick = (i)=>{
        setState(parseInt(i))
    }
    return(
        <div className={styles.container}>
            {statelist.map((item)=>{
                return(<div className={`${styles.btn} ${(state===parseInt(item["no"])) && styles.high}`} key={item["no"]} onClick={()=>handleClick(item["no"])}>{item["item"]}</div>)
            })}
        </div>
    )
}