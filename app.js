const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const socketOptions = {
    cors: {
        origin: "*",
        credentials: true,
    },
};

const io = new Server(httpServer, socketOptions);

const colorsKeys = {
    "[黒]": "\u001b[30m",
    "[赤]": "\u001b[31m",
    "[緑]": "\u001b[32m",
    "[黄]": "\u001b[33m",
    "[青]": "\u001b[34m",
    "[マゼンタ]": "\u001b[35m",
    "[シアン]": "\u001b[36m",
    "[白]": "\u001b[37m",
    "[/]": "\u001b[0m",
    "[黒背景]": "\u001b[40m",
    "[赤背景]": "\u001b[41m",
    "[緑背景]": "\u001b[42m",
    "[黄背景]": "\u001b[43m",
    "[青背景]": "\u001b[44m",
    "[マゼンタ背景]": "\u001b[45m",
    "[シアン背景]": "\u001b[46m",
    "[白背景]": "\u001b[47m",
    "[アンダーライン]": "\u001b[4m",
};

class Logger {
    constructor() {
        this.time_outputted_log_last = "";
        this.format = "level | message";
    }
    colorize(originalString) {
        let colored = originalString;
        for (const [colorsKey, value] of Object.entries(colorsKeys)) {
            colored = colored.replaceAll(colorsKey, value);
        }
        return colored;
    }

    get_current_time() {
        const currentDate = new Date();
        const hours = String(currentDate.getHours()).padStart(2, "0");
        const minutes = String(currentDate.getMinutes()).padStart(2, "0");
        const seconds = String(currentDate.getSeconds()).padStart(2, "0");

        const formattedTime = `${hours}:${minutes}:${seconds}`;

        return formattedTime;
    }

    formatString(level, message, isDisplayLevel, time) {
        if (!isDisplayLevel) {
            level = " ";
        }

        const formatKeys = {
            message: message,
            time: time,
            level: level,
        };
        let formatedMessage = this.format;
        for (const [key, value] of Object.entries(formatKeys)) {
            formatedMessage = formatedMessage.replaceAll(key, value);
        }
        return formatedMessage;
    }
    objectToString(object) {
        let objectStr = JSON.stringify(object, null, "\t");
        objectStr = objectStr.replaceAll("\n", "\n  | ");
        return objectStr;
    }

    output_log(level, message, isDisplayLevel) {
        // 時間が同じ場合は空白で埋める
        let time = this.get_current_time();
        if (time === this.time_outputted_log_last) {
            time = " ".repeat(time.length);
        } else {
            this.time_outputted_log_last = time;
        }

        if (typeof message === "string") {
            // 文字列はそのまま出力
            let output = this.formatString(level, message, isDisplayLevel, time);
            output = this.colorize(output);
            console.log(output);
        } else if (typeof message === "number") {
            // 数は青色で出力
            let output = this.formatString(level, `[青]${message}[/]`, isDisplayLevel, time);
            output = this.colorize(output);
            console.log(output);
        } else if (typeof message === "object") {
            let output = this.formatString(level, this.objectToString(message), isDisplayLevel, time);
            output = this.colorize(output);
            console.log(output);
        } else if (typeof message === "boolean") {
            if (message) {
                let output = this.formatString(level, `[シアン]${message}[/]`, isDisplayLevel, time);
                output = this.colorize(output);
                console.log(output);
            } else {
                let output = this.formatString(level, `[マゼンタ]${message}[/]`, isDisplayLevel, time);
                output = this.colorize(output);
                console.log(output);
            }
        } else if (typeof message === "undefined") {
            let output = this.formatString(level, `[黄背景]${message}[/]`, isDisplayLevel, time);
            output = this.colorize(output);
            console.log(output);
        } else {
            let output = this.formatString(level, message, isDisplayLevel, time);
            output = this.colorize(output);
            console.log(output);
        }
    }
    debug(...args) {
        for (const [index, message] of args.entries()) {
            // 最初だけログレベルを表示
            let isDisplayLevel = false;
            if (index === 0 || args.length === 1) {
                isDisplayLevel = true;
            }
            this.output_log("[青]D[/]", message, isDisplayLevel);
        }
    }

    info(...args) {
        for (const [index, message] of args.entries()) {
            // 最初だけログレベルを表示
            let isDisplayLevel = false;
            if (index === 0 || args.length === 1) {
                isDisplayLevel = true;
            }
            this.output_log("[緑]I[/]", message, isDisplayLevel);
        }
    }

    warning(...args) {
        for (const [index, message] of args.entries()) {
            // 最初だけログレベルを表示
            let isDisplayLevel = false;
            if (index === 0 || args.length === 1) {
                isDisplayLevel = true;
            }
            this.output_log("[黄]W[/]", message, isDisplayLevel);
        }
    }
    error(...args) {
        for (const [index, message] of args.entries()) {
            // 最初だけログレベルを表示
            let isDisplayLevel = false;
            if (index === 0 || args.length === 1) {
                isDisplayLevel = true;
            }
            this.output_log("[赤]E[/]", message, isDisplayLevel);
        }
    }
}
const logger = new Logger();

app.get("/", function (request, response) {
    logger.debug("receive GET");
    response.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    console.log("connection : " + socket.id);
    socket.on("disconnect", () => {
        logger.debug("切断されました");
    });
    socket.onAny((eventName, ...args) => {
        logger.debug(`イベントを受信しました ${eventName}`);

        io.emit(eventName, ...args);
    });
});

logger.info("[緑]=== sever start ===[/]");

httpServer.listen(4000);
