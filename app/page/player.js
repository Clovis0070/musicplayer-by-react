import React, {Component} from 'react';
import {MUSIC_LIST} from "../config/musiclist";
import $ from "jquery";
import Progress from '../components/progress';
import {
    Route,
    Link,
    HashRouter,
    Switch
} from 'react-router-dom'
import Pubsub from 'pubsub-js'

require('./player.less');

let duration = null;   // 保存当前歌曲的长度。

export default class Player extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progress: 0,
            volume: 40,
            isPlay: true,
            leftTime: ''
        };
    }

    formatTime(time) {
        time = Math.floor(time);
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        seconds = seconds < 10 ? `0${seconds}` : seconds;
        return `${minutes}:${seconds}`;
    }

    componentDidMount() {

        $('#player').bind($.jPlayer.event.timeupdate, (e) => {     // 绑定事件，绑定对播放时间的监听，然后执行回调函数，更新状态
            duration = e.jPlayer.status.duration; // 获取当前歌曲的时长
            this.setState({
                // volume: e.jPlayer.options.volume * 100,
                progress: e.jPlayer.status.currentTime / duration * 100,
                leftTime: this.formatTime(duration - e.jPlayer.status.currentTime)
            });
            console.log(this.state.leftTime);
        })
    }

    componentWillUnmount() {
        $('#player').unbind($.jPlayer.event.timeupdate);   // 绑定的事件一定要记得加解绑
    }

    progressChangeHandler(progress) {
        $('#player').jPlayer('play', duration * progress);
        this.setState({isPlay: true});
    }

    changeVolumeHandler(volume) {
        $('#player').jPlayer('volume', volume);
        this.setState({volume: volume * 100});
    }

    play(e) {
        if (this.state.isPlay) {
            $('#player').jPlayer('pause');
            this.setState({isPlay: false})
        } else {
            this.setState({isPlay: true});
            $('#player').jPlayer('play', duration * this.state.progress);
        }
    }

    playNext(e) {
        Pubsub.publish('PLAY_NEXT');
    }

    playPrev(e) {
        Pubsub.publish('PLAY_PREV');
    }

    changeCycleModel(e) {
        Pubsub.publish('CHANGE_CYCLE_MODEL');
    }

    render() {
        return (
            <div className="player-page">
                <h1 className="caption">
                    <Link to="/list">My Music List &gt;</Link>
                </h1>
                <div className="mt20 row">
                    <div className="controll-wrapper">
                        <h2 className="music-title">
                            {this.props.currentMusicItem.title}
                        </h2>
                        <h3 className="music-artist mt10">
                            {this.props.currentMusicItem.artist}
                        </h3>
                        <div className="row mt20">
                            <div className="left-time -col-auto">-{this.state.leftTime}</div>
                            <div className="volume-container">
                                <i className="icon-volume rt" style={{
                                    top: 5,
                                    left: -5
                                }}></i>
                                <div className="volume-wrapper">
                                    <Progress
                                        progress={this.state.volume}
                                        onProgressChange={this.changeVolumeHandler}
                                        barColor="gray"
                                    ></Progress>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            height: 10,
                            lineHeight: '10px',
                            marginTop: 10
                        }}>
                            <Progress
                                progress={this.state.progress}
                                onProgressChange={this.progressChangeHandler}
                                barColor="#0ef30e"
                            >
                            </Progress>
                        </div>
                        <div className="mt35 row">   {/* 这里是播放控制按钮，分别对应上一曲、播放暂停、下一曲 */}
                            <div>
                                <i className="icon prev" onClick={this.playPrev}></i>
                                <i className={`icon ml20 ${this.state.isPlay ? 'pause' : 'play'}`}
                                   onClick={(this.play).bind(this)}></i>
                                <i className="icon next ml20" onClick={this.playNext}></i>
                            </div>
                            <div className="-col-auto">
                                <i className={`icon repeat-${this.props.cycleModel}`}
                                   onClick={(this.changeCycleModel).bind(this)}></i>
                            </div>
                        </div>
                    </div>
                    <div className="-col-auto cover">
                        <img
                            src={this.props.currentMusicItem.cover}
                            alt={this.props.currentMusicItem.title}
                        />
                    </div>
                </div>
            </div>

        );

    }

}
