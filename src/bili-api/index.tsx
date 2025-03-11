import axios from "axios";
import { createSocket, destroySocket } from "./socket";
import { useRef } from "react";

const api = axios.create({
    baseURL: "/api"
});

function ApiDom() {
    // 替换你的秘钥
    // 替换你的主播身份码
    const codeId = useRef<HTMLInputElement | null>(null);
    // 替换你的app应用 [这里测试为互动游戏]
    const appId = useRef<HTMLInputElement | null>(null);
    // [向 node server请求接口后自动返回]
    const gameId = useRef<HTMLInputElement | null>(null);
    // v2改为server response 服务器返回websocket信息，而非手动获取
    const authBody = useRef("");
    const wssLinks = useRef([]);
    // heartBeat Timer
    const heartBeatTimer = useRef<NodeJS.Timer>(null);
    // be ready
    clearInterval(heartBeatTimer.current as NodeJS.Timeout);
    /**
     * 测试请求鉴权接口
     */
    const getAuth = () => {
        api.post("/getAuth", {
        })
            .then(({ data }) => {
                console.log("-----鉴权成功-----");
                console.log("返回：", data);
            })
            .catch((err) => {
                console.log("-----鉴权失败-----");
                console.log(err);
            });
    };

    const heartBeatThis = (game_id: string) => {
        // 心跳 是否成功
        api.post("/gameHeartBeat", {
            game_id,
        })
            .then(({ data }) => {
                console.log("-----心跳成功-----");
                console.log("返回：", data);
            })
            .catch((err) => {
                console.log("-----心跳失败-----");
                console.log(err);
            });
    };

    /**
     * @comment 注意所有的接口基于鉴权成功后才能正确返回
     * 测试请求游戏开启接口
     */
    const gameStart = () => {
        api.post("/gameStart", {
            code: codeId.current!.value,
            app_id: Number(appId.current!.value),
        })
            .then(({ data }) => {
                if (data.code === 0) {
                    const res = data.data;
                    const { game_info, websocket_info } = res;
                    const { auth_body, wss_link } = websocket_info;
                    authBody.current = auth_body;
                    wssLinks.current = wss_link;
                    console.log("-----游戏开始成功-----");
                    console.log("返回GameId：", game_info);
                    gameId.current = game_info.game_id;
                    // v2改为20s请求心跳一次，不然60s会自动关闭
                    heartBeatTimer.current = setInterval(() => {
                        heartBeatThis(game_info.game_id);
                    }, 20000);
                } else {
                    console.log("-----游戏开始失败-----");
                    console.log("原因：", data);
                }
            })
            .catch((err) => {
                console.log("-----游戏开始失败-----");
                console.log(err);
            });
    };

    /**
     * @comment 基于gameStart成功后才会关闭正常，否则获取不到game_id
     * 测试请求游戏关闭接口
     */
    const gameEnd = () => {
        api.post("/gameEnd", {
            game_id: gameId.current,
            app_id: Number(appId.current!.value),
        })
            .then(({ data }) => {
                if (data.code === 0) {
                    console.log("-----游戏关闭成功-----");
                    console.log("返回：", data);
                    // 清空长链
                    authBody.current = "";
                    wssLinks.current = [];
                    clearInterval(heartBeatTimer.current as NodeJS.Timeout);
                    handleDestroySocket();
                    console.log("-----心跳关闭成功-----");
                } else {
                    console.log("-----游戏关闭失败-----");
                    console.log("原因：", data);
                }
            })
            .catch((err) => {
                console.log("-----游戏关闭失败-----");
                console.log(err);
            });
    };


    let ws:unknown = null;
    /**
     * 测试创建长长连接接口
     */
    const handleCreateSocket = () => {
        if (authBody.current && wssLinks.current) {
            ws = createSocket(authBody.current, wssLinks.current);
        }
    };

    /**
     * 测试销毁长长连接接口
     */
    const handleDestroySocket = () => {
        if (ws != null) {
            destroySocket();
            ws = null;
        }
        console.log("-----长连接销毁成功-----");
    };


    return (
        <div>
            <button onClick={getAuth}>鉴权</button>
            <input ref={codeId} placeholder="codeId" />
            <input ref={appId} placeholder="appId" />
            <button onClick={gameStart}>游戏开始</button>

            <button onClick={gameEnd}>游戏结束</button>


            <button onClick={handleCreateSocket}>创建长连接</button>
            <button onClick={handleDestroySocket}>销毁长连接</button>
        </div>
    );
}


export default ApiDom;