import styles from "./auth.module.css";

/** "Cần hỗ trợ?" contact box — identical on both auth pages. */
export function SupportBox() {
  return (
    <div className={styles.supportBox}>
      <div className={styles.supportTitle}>
        <span style={{ color: "#585C7B" }}>Cần hỗ trợ? </span>
        <span style={{ color: "#4137F9", fontWeight: 700 }}>Luôn sẵn sàng</span>
      </div>
      <div className={styles.supportActions}>
        <a href="tel:0886020202">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.22198 11.0455C9.50559 11.1757 9.8416 11.0918 10.0307 10.8435L10.2673 10.5335C10.5191 10.1978 10.9143 10.0002 11.334 10.0002H13.334C14.0699 10.0002 14.6673 10.5976 14.6673 11.3335V13.3335C14.6673 14.0694 14.0699 14.6668 13.334 14.6668C6.70657 14.6668 1.33398 9.29425 1.33398 2.66683C1.33398 1.93094 1.93143 1.3335 2.66732 1.3335H4.66732C5.4032 1.3335 6.00065 1.93094 6.00065 2.66683V4.66683C6.00065 5.08651 5.80306 5.48169 5.46732 5.7335L5.15532 5.9675C4.90297 6.16018 4.82152 6.5041 4.96065 6.7895C5.87177 8.64007 7.37027 10.1367 9.22198 11.0455" stroke="#4137F9" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>{" "}
          0886.02.02.02
        </a>
        <span className={styles.supportSep}>·</span>
        <a href="https://zalo.me/0886020202">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.99376 10.8947C2.09179 11.142 2.11361 11.4129 2.05643 11.6727L1.34643 13.866C1.29992 14.0922 1.37373 14.3263 1.54154 14.4849C1.70935 14.6435 1.94727 14.7039 2.17043 14.6447L4.44576 13.9794C4.69091 13.9307 4.94478 13.952 5.17843 14.0407C8.11744 15.4132 11.6178 14.4712 13.4709 11.8089C15.324 9.14672 14.9921 5.53708 12.6845 3.25749C10.3769 0.977908 6.76345 0.690071 4.12406 2.57559C1.48467 4.46111 0.585457 7.97268 1.99376 10.8947" stroke="#4137F9" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>{" "}
          Nhắn Zalo
        </a>
      </div>
    </div>
  );
}
