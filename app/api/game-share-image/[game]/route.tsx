import { deflateSync } from "node:zlib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIDTH = 1200;
const HEIGHT = 630;
type RGB = [number, number, number];
type GameConfig = { title: string; subtitle: string; start: RGB; end: RGB; accent: RGB };

const games: Record<string, GameConfig> = {
  "ocean-carrom": { title: "OCEAN CARROM", subtitle: "AIM. STRIKE. POCKET THE COINS.", start: [4, 49, 70], end: [8, 105, 125], accent: [226, 184, 128] },
  chess: { title: "OCEAN CHESS", subtitle: "THINK AHEAD. MAKE YOUR MOVE.", start: [69, 31, 12], end: [153, 82, 28], accent: [246, 220, 174] },
  "ocean-solitaire": { title: "OCEAN SOLITAIRE", subtitle: "A FRESH DEAL IS WAITING.", start: [5, 78, 72], end: [30, 64, 130], accent: [220, 235, 245] },
  archery3d: { title: "ARCHERY 3D", subtitle: "AIM TRUE. HIT THE TARGET.", start: [124, 45, 18], end: [30, 58, 120], accent: [251, 191, 36] },
  "snakes-ladders": { title: "SNAKE & LADDERS", subtitle: "ROLL THE DICE. RACE TO 100.", start: [6, 78, 59], end: [21, 94, 117], accent: [134, 239, 172] },
  "tic-tac-toe": { title: "TIC TAC TOE", subtitle: "PLAY. THINK. WIN.", start: [88, 28, 135], end: [109, 40, 160], accent: [240, 171, 252] },
};

const FONT: Record<string, string[]> = {
  A:["01110","10001","10001","11111","10001","10001","10001"],B:["11110","10001","10001","11110","10001","10001","11110"],C:["01111","10000","10000","10000","10000","10000","01111"],D:["11110","10001","10001","10001","10001","10001","11110"],E:["11111","10000","10000","11110","10000","10000","11111"],F:["11111","10000","10000","11110","10000","10000","10000"],G:["01111","10000","10000","10111","10001","10001","01111"],H:["10001","10001","10001","11111","10001","10001","10001"],I:["11111","00100","00100","00100","00100","00100","11111"],J:["00111","00010","00010","00010","10010","10010","01100"],K:["10001","10010","10100","11000","10100","10010","10001"],L:["10000","10000","10000","10000","10000","10000","11111"],M:["10001","11011","10101","10101","10001","10001","10001"],N:["10001","11001","10101","10011","10001","10001","10001"],O:["01110","10001","10001","10001","10001","10001","01110"],P:["11110","10001","10001","11110","10000","10000","10000"],Q:["01110","10001","10001","10001","10101","10010","01101"],R:["11110","10001","10001","11110","10100","10010","10001"],S:["01111","10000","10000","01110","00001","00001","11110"],T:["11111","00100","00100","00100","00100","00100","00100"],U:["10001","10001","10001","10001","10001","10001","01110"],V:["10001","10001","10001","10001","10001","01010","00100"],W:["10001","10001","10001","10101","10101","10101","01010"],X:["10001","10001","01010","00100","01010","10001","10001"],Y:["10001","10001","01010","00100","00100","00100","00100"],Z:["11111","00001","00010","00100","01000","10000","11111"],
  "0":["01110","10001","10011","10101","11001","10001","01110"],"1":["00100","01100","00100","00100","00100","00100","01110"],"2":["01110","10001","00001","00010","00100","01000","11111"],"3":["11110","00001","00001","01110","00001","00001","11110"],"4":["00010","00110","01010","10010","11111","00010","00010"],"5":["11111","10000","10000","11110","00001","00001","11110"],"6":["01110","10000","10000","11110","10001","10001","01110"],"7":["11111","00001","00010","00100","01000","01000","01000"],"8":["01110","10001","10001","01110","10001","10001","01110"],"9":["01110","10001","10001","01111","00001","00001","01110"],
  "&":["01010","10100","10100","01000","10101","10010","01101"],".":["00000","00000","00000","00000","00000","00110","00110"],"!":["00100","00100","00100","00100","00100","00000","00100"],": ["00000","00110","00110","00000","00110","00110","00000"],"-":["00000","00000","00000","11111","00000","00000","00000"]
};

function makePng(game: GameConfig): Buffer {
  const pixels = new Uint8Array(WIDTH * HEIGHT * 4);
  const set = (x: number, y: number, c: RGB) => {
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
    const i = (y * WIDTH + x) * 4;
    pixels[i] = c[0]; pixels[i + 1] = c[1]; pixels[i + 2] = c[2]; pixels[i + 3] = 255;
  };
  const rect = (x: number, y: number, w: number, h: number, c: RGB) => {
    for (let yy = Math.max(0, y); yy < Math.min(HEIGHT, y + h); yy++)
      for (let xx = Math.max(0, x); xx < Math.min(WIDTH, x + w); xx++) set(xx, yy, c);
  };
  const circle = (cx: number, cy: number, radius: number, c: RGB, border?: RGB) => {
    const r2 = radius * radius, inner = (radius - 7) * (radius - 7);
    for (let y = cy - radius; y <= cy + radius; y++) for (let x = cx - radius; x <= cx + radius; x++) {
      const d = (x - cx) ** 2 + (y - cy) ** 2;
      if (d <= r2) set(x, y, border && d >= inner ? border : c);
    }
  };
  const line = (x0: number, y0: number, x1: number, y1: number, c: RGB, thick = 8) => {
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      for (let oy = -Math.floor(thick / 2); oy <= Math.floor(thick / 2); oy++)
        for (let ox = -Math.floor(thick / 2); ox <= Math.floor(thick / 2); ox++) set(x0 + ox, y0 + oy, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  const text = (value: string, x: number, y: number, scale: number, color: RGB) => {
    let cursor = x;
    for (const ch of value) {
      if (ch === " ") { cursor += 4 * scale; continue; }
      const glyph = FONT[ch] || FONT["."];
      for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++)
        if (glyph[row][col] === "1") rect(cursor + col * scale, y + row * scale, scale - 1, scale - 1, color);
      cursor += 6 * scale;
    }
  };

  for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
    const t = x / WIDTH;
    const c: RGB = [0,1,2].map(i => Math.round(game.start[i] * (1 - t) + game.end[i] * t)) as RGB;
    const glow = Math.max(0, 1 - Math.hypot(x - 960, y - 310) / 700) * 12;
    set(x, y, c.map(v => Math.min(255, v + glow)) as RGB);
  }
  // Frame and brand
  for (let t = 0; t < 4; t++) {
    rect(34, 34 + t, WIDTH - 68, 2, [220, 240, 250]);
    rect(34, HEIGHT - 38 + t, WIDTH - 68, 2, [220, 240, 250]);
    rect(34 + t, 34, 2, HEIGHT - 68, [220, 240, 250]);
    rect(WIDTH - 38 + t, 34, 2, HEIGHT - 68, [220, 240, 250]);
  }
  text("SHOPPERS OCEAN", 88, 84, 4, [210, 245, 250]);
  const titleScale = game.title.length > 14 ? 6 : 9;
  text(game.title, 88, 215, titleScale, [255, 255, 255]);
  text(game.subtitle, 92, 325, 4, [245, 248, 252]);
  text("PLAY  THINK  DISCOVER", 92, 492, 4, game.accent);
  text("SHOPPERSOCEAN.COM", 92, 548, 3, [225, 235, 245]);

  // Artwork panel on the right
  rect(700, 110, 430, 430, [245, 248, 250]);
  rect(712, 122, 406, 406, game.start);
  const cx = 915, cy = 325;
  if (game.title.includes("CARROM")) {
    rect(775, 185, 280, 280, [91, 54, 31]); rect(790, 200, 250, 250, [207, 157, 96]);
    circle(cx, cy, 78, [207, 157, 96], [93, 57, 31]); circle(cx, cy, 24, [24, 35, 49], [255,255,255]);
    circle(840, 250, 19, [250,250,250], [25,35,45]); circle(990, 390, 19, [20,20,20], [250,250,250]); circle(987, 250, 19, [185,28,45], [250,250,250]);
  } else if (game.title.includes("CHESS")) {
    for (let r=0;r<8;r++) for (let c=0;c<8;c++) rect(785+c*32,195+r*32,32,32,(r+c)%2?[185,137,85]:[244,228,201]);
    for (let c=0;c<8;c++) { circle(801+c*32,220,10,[20,35,55]); circle(801+c*32,420,10,[248,248,248],[20,35,55]); }
  } else if (game.title.includes("SOLITAIRE")) {
    for (let k=0;k<3;k++) {
      rect(790+k*82,205+k*14,112,190,[250,250,250]);
      rect(798+k*82,213+k*14,96,174,k===1?[255,245,245]:[235,242,248]);
      circle(846+k*82,300+k*14,28,k===1?[190,30,55]:[24,42,65]);
    }
  } else if (game.title.includes("ARCHERY")) {
    circle(cx,cy,150,[250,250,250],[20,35,55]); circle(cx,cy,112,[190,30,45]); circle(cx,cy,76,[250,250,250]); circle(cx,cy,42,[35,92,170]); circle(cx,cy,16,[250,190,25]);
    line(970,180,1070,280,[245,245,245],10);
  } else if (game.title.includes("SNAKE")) {
    for(let r=0;r<5;r++) for(let c=0;c<5;c++){rect(785+c*52,195+r*52,52,52,(r+c)%2?[255,243,199]:[134,239,172]);text(String(25-r*5-c),794+c*52,210+r*52,2,[20,78,85]);}
    line(815,420,1010,220,[180,83,9],17); line(815,420,1010,220,[255,240,200],5);
  } else {
    for(let k=0;k<2;k++){line(805,220+k*185,1025,220+k*185,[255,255,255],9);line(915+k*110,145,915+k*110,505,[255,255,255],9);}
    text("X",820,250,13,[253,230,138]); text("O",930,355,13,[186,230,253]); text("X",1035,250,13,[253,230,138]);
  }

  const crcTable = new Uint32Array(256);
  for (let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);crcTable[n]=c>>>0;}
  const crc32 = (buf: Buffer) => {let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
  const chunk = (type: string, data: Buffer) => {
    const name=Buffer.from(type);const length=Buffer.alloc(4);length.writeUInt32BE(data.length);
    const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));
    return Buffer.concat([length,name,data,crc]);
  };
  const raw=Buffer.alloc((WIDTH*4+1)*HEIGHT);
  for(let y=0;y<HEIGHT;y++){const row=y*(WIDTH*4+1);raw[row]=0;Buffer.from(pixels.buffer,pixels.byteOffset+y*WIDTH*4,WIDTH*4).copy(raw,row+1);}
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(WIDTH,0);ihdr.writeUInt32BE(HEIGHT,4);ihdr[8]=8;ihdr[9]=6;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ihdr),chunk("IDAT",deflateSync(raw)),chunk("IEND",Buffer.alloc(0))]);
}

export async function GET(_request: Request, context: { params: Promise<{ game: string }> }) {
  const { game } = await context.params;
  const item = games[game];
  if (!item) return new Response("Game not found", { status: 404 });
  const png = makePng(item);
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.byteLength),
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
