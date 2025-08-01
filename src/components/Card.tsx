

export default ({ title, valueText, value,date, infoBtn, valueSumm}) => {
  return (
    <div className="interest-tab-item">
      <div className="interest-tab-title">{title}</div>
      <div className="interest-summ-wrapper">
        {valueText && <div className="interest-summ-text">{valueText}</div>}
       { valueSumm &&<div className="interest-summ">{valueSumm}</div>}
       {value && <div className="interest-summ">{Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>}
        <div className="show-btn">
          {infoBtn &&<img src={infoBtn} alt=""></img>}
        </div>
        {value &&<div className="show-interest-summ">{value}</div>}
      </div>
      <div className="interest-date-wrapper">
        <div className="interest-date-text">Up to</div>
        <div className="interest-date">{date}</div>
      </div>
    </div>
  )
}
