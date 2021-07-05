import React from 'react';

const PressureBar = (props) => {
    const getWidth = (idx, fullPos, restValue) => {
      let ret = 0;
      if (idx+1 <= fullPos) {
          ret = 100;
      } else if (idx == fullPos) {
          ret = restValue;
      }
      return ret + '%';
    }
    
    let inTarget = false;
    let children = [];
    let step = props.steps;
    let percent = props.percent;
    let target = props.target;
    let width = 100 / step;
    let fullPos = Math.floor(percent / width);
    let modValue = (percent - fullPos * width) / width * 100;
    if (target !== undefined) {
        if (target < 0) target = 0;
        if (target >= step) target = step - 1;
        inTarget = (percent > target * width) && (percent <= (target+1)*width);
    }
    
    for (let i = 0; i < step; i++) {
        children.push(
            <div className="progress-steps" key={i} style={{
                height: '20px', backgroundColor: i === target?'orange' :'#f5f5f5', width: width+'%', marginRight: '2px', display: 'flex', alignItems: 'center',
            }}>
                <div className="progress-bg" style={{ 
                    width: getWidth(i, fullPos, modValue), height: '60%',backgroundColor: inTarget?'#52c41a':'#1890ff',
                    // borderRadius: '100px'
                }}></div>
            </div>);
    }
    return (
      <div className="progress" style={{width: '100%'}}>
        {/* <div className="progress-outer">
          <div className="progress-inner" style={{backgroundColor: '#f5f5f5'}}>
            <div className="progress-bg" style={{width: '30%', height: '10px',backgroundColor: '#1890ff'}}></div>
          </div>
        </div> */}
        <div className="progress-outer" style={{ display: 'flex', borderRadius:'100px'}}>
          {children}
        </div>
      </div>
    );
};

export default PressureBar;