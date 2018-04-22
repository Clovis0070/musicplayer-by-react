import React, {Component} from 'react'
import Header from './components/header'
import Player from './page/player';
import $ from 'jquery'
import jPlayer from 'jplayer';
import {
    Route,
    Link,
    HashRouter,
    Switch
} from 'react-router-dom'
import {MUSIC_LIST} from './config/musiclist';
import MusicList from './page/musiclist';
import Pubsub from 'pubsub-js'


class Root extends Component {

    constructor(props) {
        super(props);
        this.state = {
            musicList: MUSIC_LIST,
            currentMusicItem: MUSIC_LIST[1],
            cycleModel: 'cycle',
        };
    }

    componentDidMount() {
        // ready: 挂载完成时的动作，挂载完成jplayer模块就立刻播放音乐
        $("#player").jPlayer({
            ready: () => {
                $('#player').jPlayer('setMedia', {
                    mp3: this.state.currentMusicItem.file,
                }).jPlayer('play');
            },
            supplied: 'mp3',
            wmode: 'window',
            volume: 0.4
        });

        $("#player").bind($.jPlayer.event.ended, (e) => {
            this.playNext();
        });

        Pubsub.subscribe('PLAY_NEXT', () => {
            this.playNext();
        });

        Pubsub.subscribe('PLAY_PREV', ()=> {
            this.playNext('prev');
        });

        Pubsub.subscribe('CHANGE_CYCLE_MODEL', () => {
            this.changeCycleModel();
        });

        Pubsub.subscribe('PLAY_MUSIC', (msg, musicItem)=> {
            this.playMusic(musicItem);
        });

        Pubsub.subscribe('DELETE_MUSIC', (msg, musicItem) => {
            this.setState({musicList: this.state.musicList.filter(
                    item => {
                        return item != musicItem;
                    })
            });
        });
    }

    playMusic(musicItem) {
        $('#player').jPlayer('setMedia', {
            mp3: musicItem.file
        }).jPlayer('play');

        this.setState({
            currentMusicItem: musicItem
        });
    }

    playNext(type = 'next'){
        let currentMusicIndex = this.findMusicIndex();
        let musicListLength = this.state.musicList.length;
        let nextMusicIndex = currentMusicIndex;
        let modelMap = {
            'cycle': (currentMusicIndex + 1) % musicListLength,
            'random': Math.floor(Math.random()*musicListLength),
            'once': currentMusicIndex
        };
        switch(type) {
            case 'next':
                nextMusicIndex = modelMap[this.state.cycleModel];
                break;
            case 'prev':
                nextMusicIndex = (currentMusicIndex - 1) % musicListLength;
                break;
        }
        this.playMusic(this.state.musicList[nextMusicIndex]);
    }

    findMusicIndex(){
        return this.state.musicList.indexOf(this.state.currentMusicItem);
    }

    changeCycleModel(){
        let models = ['cycle', 'once', 'random'];
        let currentModelIndex = models.indexOf(this.state.cycleModel);
        let nextModel = models[(currentModelIndex + 1) % models.length];
        this.setState({cycleModel: nextModel});
    }



    componentWillUnmount() {
        // Pubsub.unsubscribe('DELETE_MUSIC');
        // Pubsub.unsubscribe('PLAY_MUSIC');
        $("player").unbind($.jPlayer.event.ended);
        Pubsub.unsubscribe('PLAY_PREV');
        Pubsub.unsubscribe('PLAY_NEXT');
        Pubsub.unsubscribe('CHANGE_CYCLE_MODE');
    }

    render() {
        return (
            <HashRouter>
                <section>
                    <Header/>
                    <Switch>
                        <Route exact path="/" render={() => <Player currentMusicItem={this.state.currentMusicItem}
                                                                    cycleModel={this.state.cycleModel}/>}/>
                        <Route exact path="/list" render={() => <MusicList musicList={this.state.musicList}
                                                                           currentMusicItem={this.state.currentMusicItem}/>}/>
                    </Switch>
                </section>
            </HashRouter>
        );
    }
}

export default Root;