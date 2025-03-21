import axios from "axios";
import { createSocket, destroySocket } from "./socket";
import { useEffect, useRef } from "react";
import { Button, InputGroup, Form, Row } from "react-bootstrap";


const api = axios.create({
    baseURL: "/api"
});

function ApiDom({ callback }: { callback: ({ name, rotate }: { name: string, rotate: number }) => void }) {

    // 主播身份码
    const codeId = useRef<HTMLInputElement | null>(null);
    // 你的app应用 
    const appId = 1743849192865;

    // [向 node server请求接口后自动返回]
    const gameId = useRef<string | null>(null);
    // v2改为server response 服务器返回websocket信息，而非手动获取
    const authBody = useRef("");
    const wssLinks = useRef([]);
    // heartBeat Timer
    const heartBeatTimer = useRef<NodeJS.Timer>(null);
    // be ready
    clearInterval(heartBeatTimer.current as NodeJS.Timeout);

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
            app_id: appId,
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
            app_id: 1743849192865,
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

    interface Message {
        cmd: string,
        data: {
            uname: string,
            uid: number,
            open_id: string,
            uface: string,
            timestamp: number,
            room_id: number,
            msg: string,
            msg_id: string,
            guard_level: number,
            fans_medal_wearing_status: boolean,
            fans_medal_name: string,
            fans_medal_level: number,
            emojo_img_url: string,
            dm_type: number, // 0 for commen 1 for emoji
            glory_level: number,
            reply_open_id: string,
            reply_uname: string,
            is_admin: number

        }
    }

    const onMessage = (res: unknown) => {
        const msg = res as Message;
        if (msg.cmd === "LIVE_OPEN_PLATFORM_DM") {
            if (msg.data.dm_type === 0) {
                const rotate = parseInt(msg.data.msg);
                if (rotate >= 0 && rotate <= 12) {
                    callback({
                        name: msg.data.uname,
                        rotate,
                    });
                }
            }
        }
    };

    let ws: unknown = null;
    /**
     * 测试创建长长连接接口
     */
    const handleCreateSocket = () => {
        if (authBody.current && wssLinks.current) {
            ws = createSocket(authBody.current, wssLinks.current, onMessage);
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


    useEffect(() => {
        window.addEventListener("beforeunload", handleCreateSocket);
        return () => {
            window.removeEventListener("beforeunload", handleDestroySocket);
        };
    });


    return (
        <>
            <InputGroup>
                <InputGroup.Text>身份码</InputGroup.Text>
                <Form.Control placeholder="codeId" ref={codeId} />
            </InputGroup>

            <Button onClick={gameStart}>游戏开始</Button>
            <Button onClick={gameEnd}>游戏结束</Button>
            <Button onClick={handleCreateSocket}>创建长连接</Button>
            <Button onClick={handleDestroySocket}>销毁长连接</Button>

        </>
    );
}


export default ApiDom;