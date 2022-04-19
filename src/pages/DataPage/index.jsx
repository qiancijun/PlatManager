import React from 'react';
import "./index.scss";
import { Bullet, Liquid, Column, RingProgress } from '@ant-design/plots';
import { CSSTransition, TransitionGroup } from 'react-transition-group' 

let globalTempData = [];
// let [otherData, setOtherData] = React.useState([]);
let otherData = [];

function useForceUpdate(){
    const [value, setValue] = React.useState(0); // integer state
    return () => setValue(value => ++value); // update the state to force render
}
export default function DataPage(props) {
    let ws = null;
    const tempRef = React.useRef();
    const humidityRef = React.useRef();
    const platRef = React.useRef();
    const forceUpdate = useForceUpdate();
    // 数据
    let platHumidityData = [
        {
            label: '一号土地',
            value: 0.1,
        },
    ];
    let interval = null;

    React.useEffect(() => {
        onConnect();
        interval = setInterval(() => {
            if (otherData.length > 0) {
                const first = otherData[0];
                otherData.shift();
                otherData = [...otherData, first];
            }
            // console.log(otherData);
        }, 2000);
        return () => {
            
        }
    }, [clearInterval(interval)]);

    const tempConfig = {
        data: globalTempData,
        measureField: 'measures',
        rangeField: 'ranges',
        targetField: 'target',
        xField: 'title',
        color: {
            range: '#00',
            measure: '#FF6A6A',
            target: '#3D76DD',
        },
        xAxis: {
            line: null,
        },
        yAxis: {
            max: 100,
            tickMethod: ({ max }) => {
                const interval = Math.ceil(max / 5); // 自定义刻度 ticks

                return [-40, -20, 0, interval, interval * 2, interval * 3, interval * 4, max];
            },
        },
        tooltip: {
            formatter: (d) => {
                return {name: "测量温度", value: d.measures + "℃"};
            }
        },
        // 自定义 legend
        legend: {
            custom: true,
            position: 'bottom',
            items: [
                {
                    value: '测量温度',
                    name: '测量温度',
                    marker: {
                        symbol: 'square',
                        style: {
                            fill: '#FF6A6A',
                            r: 5,
                        },
                    },
                },
            ],
        },
    };
    const humidityConfig = {
        percent: 0.34,
        shape: 'rect',
        outline: {
          border: 1,
          distance: 2,
        },
        wave: {
          length: 128,
        },
        pattern: {
          type: 'line',
        },
        statistic: {
            title: {
                content: "空气湿度",
                style: {
                    color: "white",
                    fontSize: "30px", 
                },
                offsetY: -40
            },
            content: {
                style: {
                    color: "white"
                }
            },
        }
    };
    const humidityConfig2 = {
        percent: 0.63,
        shape: 'rect',
        outline: {
          border: 1,
          distance: 2,
        },
        wave: {
          length: 128,
        },
        pattern: {
          type: 'line',
        },
        statistic: {
            title: {
                content: "土地平均湿度",
                style: {
                    color: "white",
                    fontSize: "20px", 
                },
                offsetY: -40
            },
            content: {
                style: {
                    color: "white"
                }
            },
        }
    };
    const platHumidityConfig = {
        data: platHumidityData,
        xField: 'key',
        yField: 'value',
        label: {
            // 可手动配置 label 数据标签位置
            position: 'middle',
            // 'top', 'bottom', 'middle',
            // 配置样式
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
        meta: {
            key: {
                alias: '机器标签',
            },
            value: {
                alias: '湿度%',
            },
        },
    };
    const cpuConfig = {
        padding: 'auto',
        autoFit: false,
        percent: 0.7,
        color: ['#5B8FF9', '#E8EDF3'],
        statistic: {
            title: {
                content: "cpu占用率",
                style: {
                    color: "white",
                    fontSize: "20px", 
                },
            },
            content: {
                style: {
                    color: "white"
                }
            },
        }
    }
    const memoryConfig = {
        padding: 'auto',
        autoFit: false,
        percent: 0.9,
        color: ['#F4664A', '#E8EDF3'],
        // color: (d) => {
        //     console.log(d);
        // },
        statistic: {
            title: {
                content: "内存占用率",
                style: {
                    color: "white",
                    fontSize: "20px", 
                },
            },
            content: {
                style: {
                    color: "white"
                }
            },
        }
    }

    function renderTempGraph(e) {
        let tempData = [];
        let humidityData = [];
        const data = JSON.parse(e.data);
        data.temp.forEach(
            d => {
                tempData.push({
                    title: d.key,
                    ranges: [-40, 60],
                    measures: [d.value],
                    target: 100,
                });
            }
        );

        humidityData = data.humidity;
        if (humidityData.length != platHumidityData.length || platHumidityData.length == 0) {
            platHumidityData = humidityData;
            // 更新数据
            platRef.current.getChart().update({
                ...platHumidityConfig,
                data: platHumidityData,
            })
        } else {
            for (let i = 0; i < humidityData.length; i++) {
                if (humidityData[i].label != platHumidityData[i].label || 
                    humidityData[i].value != platHumidityData[i].value) {
                        platHumidityData = humidityData;
                        // 更新数据
                        platRef.current.getChart().update({
                            ...platHumidityConfig,
                            data: platHumidityData,
                        })
                        break;
                    }
            }
        }

        // 比较前后数据不同，不相同才渲染，否则不渲染
        if (tempData.length != globalTempData.length || globalTempData.length == 0) {
            globalTempData = tempData
            tempRef.current.getChart().update({
                ...tempConfig,
                data: globalTempData,
            });
        } else {
            for (let i = 0; i < globalTempData.length; i++) {
                if (globalTempData[i].measures[0] != tempData[i].measures[0]) {
                    globalTempData = tempData
                    tempRef.current.getChart().update({
                        ...tempConfig,
                        data: globalTempData,
                    });
                    break;
                }
            }
        }

        // 其他数据
        if (otherData.length == 0) {
            if (data.other != null) {
                data.other.forEach(
                    d => {
                        const key = d.key;
                        const value = d.value;
                        // otherData.push({
                        //     key: key,
                        //     value: value,
                        // })
                        otherData.push((
                            <div className='-other-data'>
                                <div className='-other-data-key'>{key}</div>
                                <div className='-other-data-value'>{value}</div>
                            </div>
                        ));
                    }
                );
                forceUpdate();
            }   
        }
        
    }

    // onSendMsg = () => {
    //     ws.send(this.msgRef.current!.value);
    // }

    function onConnect() {
        const { dataUrl } = props.location.query;
        if (ws == null) {
            // ws = new WebSocket("ws://localhost:8080/data/ws");
            ws = new WebSocket("ws://" + dataUrl);
            ws.onopen = () => {
                // ws.send("hello");
                console.log("连接成功");
            }
            ws.onclose = () => {
                console.log("连接断开");
            }
            ws.onerror = (e) => {
                console.log(e);
            }
            ws.onmessage = (e) => {
                renderTempGraph(e);
            }
        }
    }

    return (
        <div className="-data-container">
            <div className="-left-container">
                <Liquid style={{ height: "50%" }} ref={ humidityRef } {...humidityConfig} />
                <Liquid style={{ height: "50%" }} ref={ humidityRef } {...humidityConfig2} />
            </div>
            <div className="-middle-container">
                <div className="-temp-box">
                    <Bullet style={{ height: "100%", width: "100%", margin: "5px" }} ref={tempRef} {...tempConfig} />
                </div>
                <div className="-humidity-box">
                    <Column style={{ height: "100%", width: "100%", margin: "5px" }} ref={platRef} {...platHumidityConfig}/>
                    {/* <Liquid style={{ height: "100%" }} ref={ humidityRef } {...humidityConfig} /> */}
                </div>
            </div>
            <div className="-right-container">
                <div className="-pc-container">
                    <div className="-cpu-container">
                        <RingProgress {...cpuConfig} />
                    </div>
                    <div className="-memory-container">
                        <RingProgress {...memoryConfig} />
                    </div>
                </div>
                <div className="-other-data-container">
                    {/* <TransitionGroup>
                        {otherData.map((data) => {
                            <CSSTransition
                                key={data.key}
                                classNames="otherData"
                                timeout={1000}
                            >
                                <div className='-other-data'>
                                    <div className='-other-data-key'>{data.key}</div>
                                    <div className='-other-data-value'>{data.value}</div>
                                </div>
                            </CSSTransition>
                        })}
                    </TransitionGroup> */}
                    <CSSTransition
                        timeout={200}
                        classNames="otherData"
                        in={true}
                    >
                        <>
                            {otherData}
                        </>
                    </CSSTransition>
                    <i className='--border-tl --border'></i>
                    <i className='--border-tr --border'></i>
                    <i className='--border-bl --border'></i>
                    <i className='--border-br --border'></i>
                </div>
            </div>
        </div>
    )
}
