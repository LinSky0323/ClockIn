import styles from "./DateBar.module.css"

export function DateBar(){
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()+1
    const day = date.getDate()

    return(
        <div className={styles.title}>{`${year}年${month}月${day}日`}</div>
    )
}