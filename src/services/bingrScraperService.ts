import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import axios from 'axios';
import nacl from 'tweetnacl';
import { scrapeAnimeEpisode, resolveMalIdFromTitle, fetchAniSkipTimes, resolveZokoStream, resolveRavokStream, fetchAniListEpisodes } from './animeScraperService';
import { fetchAnivexaBestStream, fetchAnivexaWatch } from './anivexaService';
import { resolveTokyoInsiderStream } from './tokyoInsiderService';
import { resolveRareAnimeStream } from './rareAnimesService';
import { scrapeMegaPlayAnime, getMegaPlayToken } from './megaPlayService';
import { SubtitleService } from './subtitleService';
import { searchKissKh, getKissKhDrama, resolveKissKhEpisode } from './kisskhService';
import { searchAsiaflix, resolveAsiaflixEpisodeStream } from './asiaflixService';
import { scrapeMovies4uCluster } from './movies4uService';
import { getCineProStreams } from './cineproService';
import { scrapeFrameXStream } from './framexService';
import { resolveMegaPlayBuzzStream } from './megaPlayBuzzService';
import { resolveAnimePaheStream } from './animePaheService';
import { resolveMovieBoxStream } from './movieBoxService';
import { NetMirrorService } from './netMirrorService';
import { NestZoneAnimeService } from './nestzoneAnimeService';
import {
    findSmMovieStream,
    searchSmMovies,
    getSmMovieCategories,
    getSmMoviesByCategory,
    initSmMovieAutoUpdate
} from './smMovieHubService';

export const tmdbAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 50,
    keepAliveMsecs: 20000,
    rejectUnauthorized: true
});

export interface BingrServerCluster {
    id: string;
    name: string;
    cc: string;
    priority: number;
}

export interface CdnHeaders {
    referer?: string;
    origin?: string;
    userAgent: string;
}

export function getCdnHeaders(url?: string): CdnHeaders {
    const defaultUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
    if (!url) return { userAgent: defaultUa };
    const lower = url.toLowerCase();

    if (lower.includes('googlevideo.com') || lower.includes('blogger.com')) {
        return {
            referer: 'https://www.blogger.com/',
            origin: 'https://www.blogger.com',
            userAgent: defaultUa
        };
    }

    if (lower.includes('nexabloom') || lower.includes('megaplay.buzz')) {
        return {
            referer: 'https://megaplay.buzz/',
            origin: 'https://megaplay.buzz',
            userAgent: defaultUa
        };
    }

    if (lower.includes('aoneroom.com') || lower.includes('moviebox')) {
        return {
            referer: 'https://movieboxonline.net/',
            origin: 'https://movieboxonline.net',
            userAgent: defaultUa
        };
    }

    if (
        lower.includes('vidrift.in') ||
        lower.includes('embed.vidrift.in') ||
        lower.includes('vidrift.net') ||
        lower.includes('mb.vidrift.net') ||
        lower.includes('milkyway.cymru') ||
        lower.includes('reelvault.click')
    ) {
        return {
            referer: 'https://embed.vidrift.in/',
            origin: 'https://embed.vidrift.in',
            userAgent: defaultUa
        };
    }

    if (
        lower.includes('hakunamatata') ||
        lower.includes('hakunaymatata') ||
        lower.includes('dash-hls-bridge') ||
        lower.includes('workers.dev')
    ) {
        return {
            referer: 'https://bingr.one/',
            origin: 'https://bingr.one',
            userAgent: defaultUa
        };
    }

    if (lower.includes('vidlink') || lower.includes('vodvidl') || lower.includes('frostywinds')) {
        return {
            referer: 'https://vidlink.pro/',
            origin: 'https://vidlink.pro',
            userAgent: defaultUa
        };
    }

    if (lower.includes('dramahot.top') || lower.includes('zokoanime.video')) {
        return {
            referer: 'https://zokoanime.video/',
            origin: 'https://zokoanime.video',
            userAgent: defaultUa
        };
    }

    if (
        lower.includes('animecurx.tech') ||
        lower.includes('rousav.tech') ||
        lower.includes('dramahot.top') ||
        lower.includes('zokoanime') ||
        lower.includes('streamrip.fun') ||
        lower.includes('bingr.one')
    ) {
        return {
            referer: 'https://bingr.one/',
            origin: 'https://bingr.one',
            userAgent: defaultUa
        };
    }

    if (lower.includes('m4uplay') || lower.includes('callistanise') || lower.includes('acek-cdn')) {
        return {
            referer: 'https://m4uplay.quest/',
            origin: 'https://m4uplay.quest',
            userAgent: defaultUa
        };
    }

    if (
        lower.includes('nexabloom') ||
        lower.includes('megaplay') ||
        lower.includes('mistyhorizon') ||
        lower.includes('horizon') ||
        lower.includes('goldenanchor') ||
        lower.includes('filmu.in') ||
        lower.includes('midnightvoyage') ||
        lower.includes('onehpanddreaming') ||
        lower.includes('broforgotsave') ||
        lower.includes('eclipseharbor') ||
        (lower.includes('.space') && lower.includes('/anime/')) ||
        (lower.includes('/anime/') && !lower.includes('animesalt') && !lower.includes('ravok'))
    ) {
        return {
            referer: 'https://megaplay.buzz/',
            origin: 'https://megaplay.buzz',
            userAgent: defaultUa
        };
    }

    if (
        lower.includes('ravok') ||
        lower.includes('as-cdn') ||
        lower.includes('animesalt')
    ) {
        return {
            referer: 'https://animesalt.cx/',
            origin: 'https://animesalt.cx',
            userAgent: defaultUa
        };
    }

    if (lower.includes('b-cdn.net') || lower.includes('fibwatch') || lower.includes('fertgh')) {
        return {
            referer: 'https://fibwatch.art/',
            origin: 'https://fibwatch.art',
            userAgent: defaultUa
        };
    }

    if (
        lower.includes('kisskh') ||
        lower.includes('cdnvideo') ||
        lower.includes('newvideostream')
    ) {
        return {
            referer: 'https://kisskh.co/',
            origin: 'https://kisskh.co',
            userAgent: defaultUa
        };
    }

    if (lower.includes('filmu.in') || lower.includes('bingr.one')) {
        return {
            referer: 'https://bingr.one/',
            origin: 'https://bingr.one',
            userAgent: defaultUa
        };
    }

    if (
        lower.includes('framextv') ||
        lower.includes('cheaptruckrepairs') ||
        lower.includes('krussdomi') ||
        lower.includes('bwcvxn')
    ) {
        return {
            referer: 'https://framextv.xyz/',
            origin: 'https://framextv.xyz',
            userAgent: defaultUa
        };
    }

    if (
        lower.includes('2embed') ||
        lower.includes('streamsrcs') ||
        lower.includes('2vcdn') ||
        lower.includes('vidsrc.buzz') ||
        lower.includes('videm.buzz')
    ) {
        const isBuzz = lower.includes('vidsrc.buzz') || lower.includes('videm.buzz');
        return {
            referer: isBuzz ? (lower.includes('videm') ? 'https://videm.buzz/' : 'https://vidsrc.buzz/') : 'https://streamsrcs.2embed.cc/',
            origin: isBuzz ? (lower.includes('videm') ? 'https://videm.buzz' : 'https://streamsrcs.2embed.cc') : 'https://streamsrcs.2embed.cc',
            userAgent: defaultUa
        };
    }

    if (
        lower.includes('smashystream') ||
        lower.includes('embed.smashystream.com')
    ) {
        return {
            referer: 'https://embed.smashystream.com/',
            origin: 'https://embed.smashystream.com',
            userAgent: defaultUa
        };
    }

    if (lower.includes('aniembed.se') || lower.includes('aniembed')) {
        return {
            referer: 'https://aniembed.se/',
            origin: 'https://aniembed.se',
            userAgent: defaultUa
        };
    }

    return { userAgent: defaultUa };
}

export function requiresReferer(url?: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
        lower.includes('vidlink') ||
        lower.includes('vodvidl') ||
        lower.includes('frostywinds') ||
        lower.includes('2embed') ||
        lower.includes('streamsrcs') ||
        lower.includes('2vcdn') ||
        lower.includes('smashystream') ||
        lower.includes('aniembed') ||
        lower.includes('vidrift') ||
        lower.includes('reelvault') ||
        lower.includes('animecurx.tech') ||
        lower.includes('rousav.tech') ||
        lower.includes('streamrip.fun') ||
        lower.includes('bingr.one') ||
        lower.includes('m4uplay') ||
        lower.includes('callistanise') ||
        lower.includes('acek-cdn') ||
        lower.includes('nexabloom') ||
        lower.includes('megaplay') ||
        lower.includes('goldenanchor') ||
        lower.includes('midnightvoyage') ||
        lower.includes('onehpanddreaming') ||
        lower.includes('broforgotsave') ||
        lower.includes('ravok') ||
        lower.includes('as-cdn') ||
        lower.includes('animesalt') ||
        lower.includes('cdnvideo') ||
        lower.includes('newvideostream') ||
        lower.includes('filmu.in') ||
        lower.includes('fibwatch') ||
        lower.includes('fertgh') ||
        lower.includes('kisskh') ||
        lower.includes('hakunamatata') ||
        lower.includes('hakunaymatata') ||
        lower.includes('krussdomi') ||
        lower.includes('bwcvxn')
    );
}

export function normalizeServerId(rawSrv?: string): string | undefined {
    if (!rawSrv) return undefined;
    const lower = rawSrv.toLowerCase().trim();
    const map: Record<string, string> = {
        'prism': 'prism',
        'citadel': 'citadel',
        'edge': 'evion',
        'evion': 'evion',
        'pulse': 'pulse',
        'volt': 'volt',
        'nimbus': 'nimbus',
        'singularity': 'evion',
        'bing_anime': 'bing_anime',
        'binganime': 'bing_anime',
        'bing-anime': 'bing_anime',
        'anivexa': 'anivexa',
        'kitsune': 'anivexa',
        'reanime': 'reanime',
        'framex': 'framex',
        'framextv': 'framex',
        'polaris': 's70',
        'aphelion': 's40',
        'darkmatter': 's40',
        'moscow': 's80',
        'novo': 's81',
        'nova': 's30',
        'edmunds': 's3',
        'edmedus': 's3',
        'edmendus': 's3',
        'edmund': 's3',
        'bastion': 's62',
        'baiston': 's62',
        'orion': 's31',
        'ornion': 's31',
        'vertex': 's60',
        'corvus': 's61',
        'hallyu': 's63',
        'phoenix': 's71',
        'paris': 's72',
        'quasar': 's12',
        'sirius': 's11',
        'delta': 's50',
        'delta+': 's51',
        'deltaplus': 's51',
        'miller': 's1',
        'mann': 's2',
        'luna': 's4',
        'aditya': 's5',
        'megaplay_buzz': 'megaplay_buzz',
        'megaplaybuzz': 'megaplay_buzz',
        'animepahe': 'animepahe',
        'pahe': 'animepahe',
        'moviebox': 'moviebox',
        'movieboxonline': 'moviebox',
        'movies4u': 'm4u',
        'm4u': 'm4u',
        'cinepro': 'cinepro',
        'cine pro': 'cinepro',
        'cine_pro': 'cinepro',
        'cine-pro': 'cinepro',
        'sm_hub': 'sm_hub',
        'smmovies': 'sm_hub',
        'smhub': 'sm_hub',
        'sm movie pro': 'sm_hub',
        'sm_movie_pro': 'sm_hub',
        'sm-movie-pro': 'sm_hub',
        'sm movie': 'sm_hub',
        'smmoviepro': 'sm_hub',
        'moviespro': 'sm_hub',
        'movies_pro': 'sm_hub',
        'moviepro': 'sm_hub',
        'movie_pro': 'sm_hub',
        'tokyoinsider': 'tokyoinsider',
        'tokyo': 'tokyoinsider',
        'tokyo-insider': 'tokyoinsider',
        'hianime': 'hianime',
        'megaplay': 'hianime',
        'animesalt': 'animesalt',
        'anime': 'animesalt',
        'asiaflix': 'asiaflix',
        'kisskh': 'kisskh',
        'filmu': 'filmu',
        'vidbolt': 'vidbolt',
        'vidy': 'vidy',
        'cinezo': 'cinezo',
        'vidrift': 'vidrift',
        'vidlink': 'vidlink',
        'vidlinkpro': 'vidlink',
        'vidsrc': 'vidsrc',
        'two_embed': 'two_embed',
        '2embed': 'two_embed',
        'twoembed': 'two_embed',
        'smashy': 'smashy',
        'smashystream': 'smashy',
        'aniembed': 'aniembed',
        'ani_embed': 'aniembed',
        'zanix': 'zanix',
        'flux': 'flux',
        'vidbinge': 'flux',
        'sudoflix': 'flux',
        'netmirror': 'netmirror',
        'nestzone': 'nestzone',
        'miku': 'nestzone'
    };
    return map[lower] || lower;
}

// ==========================================
// 🚀 VIDLINK PRO NATIVE DECRYPTOR & SCRAPER
// ==========================================
const VIDLINK_KEY_HEX = 'c75136c5668bbfe65a7ecad431a745db68b5f381555b38d8f6c699449cf11fcd';
const VIDLINK_KEY = Buffer.from(VIDLINK_KEY_HEX, 'hex');
const VIDLINK_NONCE = Buffer.alloc(24, 0);

export function encryptVidlinkToken(mediaId: string | number): string {
    const timestamp = Math.floor(Date.now() / 1000) + 480;
    const mediaIdBuf = Buffer.from(String(mediaId), 'utf-8');
    const tsBuf = Buffer.alloc(8);
    tsBuf.writeBigInt64BE(BigInt(timestamp));
    const message = Buffer.concat([mediaIdBuf, tsBuf]);
    const encrypted = nacl.secretbox(message, VIDLINK_NONCE, VIDLINK_KEY);
    const fullPayload = Buffer.concat([VIDLINK_NONCE, Buffer.from(encrypted)]);
    return fullPayload.toString('base64url').replace(/=/g, '');
}

export async function scrapeVidlinkStream(params: {
    tmdbId: string | number;
    type: 'movie' | 'tv' | 'anime';
    season?: number;
    episode?: number;
    malId?: string | number;
    subOrDub?: 'sub' | 'dub';
}): Promise<any> {
    try {
        const isAnime = (params.type === 'anime' || Boolean(params.malId)) && params.type !== 'movie';
        const s = params.season || 1;
        const e = params.episode || 1;
        const isSeries = (params.type === 'tv' || isAnime) && params.type !== 'movie';

        // VidLink uses TMDB token under /api/b/tv or /api/b/movie with multiLang=1
        const targetId = params.tmdbId || params.malId;
        if (!targetId) return { success: false, sources: [], subtitles: [] };

        const token = encryptVidlinkToken(targetId);
        const url = isSeries
            ? `https://vidlink.pro/api/b/tv/${token}/${s}/${e}?multiLang=1`
            : `https://vidlink.pro/api/b/movie/${token}?multiLang=1`;

        const baseHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            'Origin': 'https://vidlink.pro',
            'Referer': 'https://vidlink.pro/'
        };

        const sources: any[] = [];
        const subtitles: any[] = [];

        // Parallel fetch: webkit (returns CloudFront signed DASH adaptive manifest with multi-audio tracks)
        // and standard (returns multi-bitrate H.264/HEVC MP4 files)
        const [dashRes, fileRes] = await Promise.allSettled([
            axios.get(url, { headers: { ...baseHeaders, 'X-Playback-Environment': 'webkit' }, timeout: 5000 }),
            axios.get(url, { headers: { ...baseHeaders, 'X-Playback-Environment': 'standard' }, timeout: 5000 })
        ]);

        const directSources: any[] = [];
        const dashSources: any[] = [];

        if (fileRes.status === 'fulfilled' && fileRes.value.data?.stream?.qualities) {
            const qObj = fileRes.value.data.stream.qualities;
            const sortedQualities = Object.keys(qObj).sort((a, b) => (parseInt(b) || 0) - (parseInt(a) || 0));
            const h264Items: any[] = [];
            const hevcItems: any[] = [];
            for (const q of sortedQualities) {
                const item = qObj[q];
                if (item && item.url) {
                    const isHevc = item.codecName === 'hevc' || item.url.includes('/h265/') || item.url.includes('hevc');
                    const entry = {
                        url: `/stream_proxy.php?url=${encodeURIComponent(item.url)}`,
                        rawUrl: item.url,
                        directUrl: item.url,
                        quality: q + 'p',
                        type: 'video/mp4',
                        label: `VidLink ${q}p (${isHevc ? 'HEVC 10-Bit' : 'H.264 HD'})`,
                        provider: 'vidlink',
                        isDub: false,
                        skipProxy: false
                    };
                    if (isHevc) hevcItems.push(entry);
                    else h264Items.push(entry);
                }
            }
            directSources.push(...h264Items, ...hevcItems);

            if (Array.isArray(fileRes.value.data?.stream?.captions)) {
                for (const c of fileRes.value.data.stream.captions) {
                    subtitles.push({
                        lang: c.language || 'en',
                        url: c.url,
                        label: c.language || 'English'
                    });
                }
            }
        }

        if (dashRes.status === 'fulfilled' && dashRes.value.data?.stream) {
            const st = dashRes.value.data.stream;
            if (st.playlist) {
                let proxyUrl = `/stream_proxy.php?url=${encodeURIComponent(st.playlist)}`;
                if (st.playlistHeaders?.Cookie) {
                    proxyUrl = `/stream_proxy.php?url=${encodeURIComponent(st.playlist + '|Cookie=' + encodeURIComponent(st.playlistHeaders.Cookie))}`;
                }
                dashSources.push({
                    url: proxyUrl,
                    rawUrl: st.playlist,
                    directUrl: st.playlist,
                    quality: 'Adaptive Multi-Audio',
                    type: 'application/dash+xml',
                    label: 'VidLink Master (Multi-Audio HLS/DASH)',
                    provider: 'vidlink',
                    isDirectM3u: true,
                    skipProxy: false
                });
            }
            if (subtitles.length === 0 && Array.isArray(st.captions)) {
                for (const c of st.captions) {
                    subtitles.push({
                        lang: c.language || 'en',
                        url: c.url,
                        label: c.language || 'English'
                    });
                }
            }
        }

        sources.push(...directSources, ...dashSources);

        return { success: sources.length > 0, sources, subtitles };
    } catch (e: any) {
        console.warn('[VidLink Scraper Error]:', e?.message || e);
    }
    return { success: false, sources: [], subtitles: [] };
}

// ==========================================
// 🚀 VIDRIFT NATIVE SCRAPER
// ==========================================
export async function scrapeVidriftStream(params: {
    tmdbId: string | number;
    type: 'movie' | 'tv' | 'anime';
    season?: number;
    episode?: number;
}): Promise<any> {
    try {
        const s = params.season || 1;
        const e = params.episode || 1;
        const embedUrl = (params.type === 'tv' || params.type === 'anime')
            ? `https://embed.vidrift.in/embed/tv/${params.tmdbId}/${s}/${e}`
            : `https://embed.vidrift.in/embed/movie/${params.tmdbId}`;

        const htmlRes = await axios.get(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
            },
            timeout: 7000
        });

        const match = htmlRes.data.match(/embedMeta\s*=\s*({[\s\S]*?});/);
        if (!match) return { success: false, sources: [], subtitles: [] };

        const meta = JSON.parse(match[1]);
        const velaSources: any[] = [];
        const orionMp4Sources: any[] = [];
        const orionHlsSources: any[] = [];

        const token = meta.playbackToken;
        if (token) {
            const path = (params.type === 'tv' || params.type === 'anime')
                ? `tv/${params.tmdbId}/${s}/${e}`
                : `movie/${params.tmdbId}`;

            const apiUrl = `https://embed.vidrift.in/api/source/${path}?token=${encodeURIComponent(token)}`;
            try {
                const apiRes = await axios.get(apiUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': embedUrl
                    },
                    timeout: 7000
                });

                if (apiRes.data && apiRes.data.success && Array.isArray(apiRes.data.streams)) {
                    for (const st of apiRes.data.streams) {
                        const streamUrl = st.proxyUrl || st.url;
                        if (streamUrl) {
                            velaSources.push({
                                url: `/stream_proxy.php?url=${encodeURIComponent(streamUrl)}`,
                                rawUrl: streamUrl,
                                quality: st.maxRes ? `${st.maxRes}p` : '1080p',
                                type: 'application/x-mpegurl',
                                label: `Vidrift ${st.provider || 'Vela'} (${st.quality || '1080p HD'})`,
                                provider: st.provider || 'vidrift',
                                skipProxy: false
                            });
                        }
                    }
                }
            } catch (_) {}
        }

        // 2. Orion Multi-Dub Direct Streams (Original, Hindi, Tamil, Telugu, etc.)
        if (Array.isArray(meta.orionStreams)) {
            for (const ost of meta.orionStreams) {
                let sUrl = ost.proxyUrl || ost.url;
                if (sUrl) {
                    if (sUrl.startsWith('/')) {
                        sUrl = `https://embed.vidrift.in${sUrl}`;
                    }
                    const isMp4 = ost.type === 'mp4' || sUrl.includes('.mp4');
                    const entry = {
                        url: `/stream_proxy.php?url=${encodeURIComponent(sUrl)}`,
                        rawUrl: sUrl,
                        quality: '1080p',
                        type: isMp4 ? 'video/mp4' : 'application/x-mpegurl',
                        label: `Vidrift Orion · ${ost.name || 'Original'}`,
                        provider: 'vidrift',
                        audio: ost.name || 'Default',
                        skipProxy: false
                    };
                    if (isMp4) orionMp4Sources.push(entry);
                    else orionHlsSources.push(entry);
                }
            }
        }

        // Put universal H.264 Vela HLS & Orion MP4 streams before HEVC Orion HLS streams
        const sources: any[] = [...velaSources, ...orionMp4Sources, ...orionHlsSources];

        return {
            success: sources.length > 0,
            sources,
            subtitles: [],
            primaryM3u8: sources[0]?.url
        };
    } catch (e: any) {
        console.warn('[Vidrift Scraper Error]:', e?.message || e);
    }
    return { success: false, sources: [], subtitles: [] };
}

// ==========================================
// 🚀 FILMU / VIDLY NATIVE CIPHER SCRAPER
// ==========================================
const FILMU_KEY = "vY7#qL2!mZ9@wK4$";

export function decryptFilmuPayload(payload: string): any {
    if (!payload || !payload.startsWith("v1.")) throw new Error("bad payload");
    const base64 = payload.slice(3).replace(/-/g, "+").replace(/_/g, "/");
    const raw = Buffer.from(base64, 'base64');
    const s = raw.subarray(0, 12);
    const n = Buffer.from(raw.subarray(12));

    const keys = (function(nonce: Buffer) {
        const t: number[] = [];
        for (let sIdx = 0; sIdx < 4; sIdx++) {
            let num = (0x811c9dc5 ^ 0x9e3779b9 * sIdx) >>> 0;
            for (let i = 0; i < FILMU_KEY.length; i++) num = Math.imul(num ^ FILMU_KEY.charCodeAt(i), 0x1000193) >>> 0;
            for (let i = 0; i < nonce.length; i++) num = Math.imul(num ^ nonce[i], 0x1000193) >>> 0;
            t.push(num);
        }
        return t;
    })(s);

    let [k0, k1, k2, k3] = keys;
    let r = 0;
    for (let t = 0; t < n.length; t++) {
        if ((3 & t) === 0) {
            k2 >>>= 0; k3 >>>= 0;
            let sum = ((k0 >>>= 0) + (k1 >>>= 0)) | 0;
            k0 = k1 ^ (k1 >>> 9);
            k1 = (k2 + (k2 << 3)) | 0;
            k2 = ((k2 << 21 | k2 >>> 11) + (sum = (sum + (k3 = (k3 + 1) | 0)) | 0)) | 0;
            r = sum >>> 0;
        }
        n[t] ^= (r >>> ((3 & t) * 8)) & 255;
    }

    return JSON.parse(n.toString('utf-8'));
}

export async function scrapeFilmuStream(params: {
    tmdbId: string | number;
    type: 'movie' | 'tv' | 'anime';
    season?: number;
    episode?: number;
}): Promise<any> {
    try {
        const s = params.season || 1;
        const e = params.episode || 1;
        const targetUrl = (params.type === 'tv' || params.type === 'anime')
            ? `https://embed.filmu.in/tv/${params.tmdbId}/${s}/${e}`
            : `https://embed.filmu.in/movie/${params.tmdbId}`;

        let htmlData = '';
        try {
            const res = await axios.get(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
                    'Referer': 'https://embed.filmu.in/'
                },
                timeout: 7500
            });
            htmlData = String(res.data || '');
        } catch (_) {}

        if (!htmlData || !htmlData.includes('v1.')) {
            const fallbackUrl = (params.type === 'tv' || params.type === 'anime')
                ? `https://vidly.pro/embed/tv/${params.tmdbId}/${s}/${e}`
                : `https://vidly.pro/embed/movie/${params.tmdbId}`;
            try {
                const resFallback = await axios.get(fallbackUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
                        'Referer': 'https://embed.filmu.in/'
                    },
                    timeout: 7500
                });
                htmlData = String(resFallback.data || '');
            } catch (_) {}
        }

        const match = htmlData.match(/\"(v1\.[a-zA-Z0-9_\-]{80,})\"/) || htmlData.match(/sealed\\?":\\?"(v1\.[^\\"]+)/);
        if (!match) return { success: false, sources: [], subtitles: [] };

        const decrypted = decryptFilmuPayload(match[1]);
        if (!decrypted || !Array.isArray(decrypted.streams)) {
            return { success: false, sources: [], subtitles: [] };
        }

        const sources: any[] = [];
        for (const st of decrypted.streams) {
            if (st.url && !st.url.includes('tiles')) {
                sources.push({
                    url: `/stream_proxy.php?url=${encodeURIComponent(st.url)}`,
                    rawUrl: st.url,
                    quality: st.quality || '1080p',
                    type: 'application/x-mpegurl',
                    label: `Filmu ${decrypted.provider?.label || st.label || 'Direct HLS'}`,
                    provider: decrypted.provider?.id || 'filmu',
                    skipProxy: false
                });
            }
        }

        const subtitles = (decrypted.subtitles || []).map((c: any) => ({
            lang: c.lang || c.label || 'en',
            url: c.url,
            label: c.label || 'English'
        }));

        return {
            success: sources.length > 0,
            sources,
            subtitles,
            primaryM3u8: sources[0]?.url
        };
    } catch (e: any) {
        console.warn('[Filmu Scraper Error]:', e?.message || e);
    }
    return { success: false, sources: [], subtitles: [] };
}

// ==========================================
// 🚀 VIDSRC NATIVE WASM DIRECT M3U SCRAPER (PURE STREAMS - NO EMBEDS)
// ==========================================
export async function scrapeVidsrcStream(params: {
    id: string | number;
    type: 'movie' | 'tv' | 'anime';
    season?: number;
    episode?: number;
}): Promise<any> {
    try {
        const s = params.season || 1;
        const e = params.episode || 1;
        const isTv = params.type === 'tv' || params.type === 'anime';

        // Base domain cascade (verified active mirrors)
        const vsDomains = ['https://vidsrc.pm', 'https://vidsrc.sh', 'https://vidsrc.to'];
        let rawUrls: string[] = [];
        let subtitlesList: any[] = [];

        for (const baseDomain of vsDomains) {
            try {
                const vsUrl = isTv
                    ? `${baseDomain}/vs_src.php?type=tv&id=${params.id}&season=${s}&episode=${e}`
                    : `${baseDomain}/vs_src.php?type=movie&id=${params.id}`;

                const r1 = await axios.get(vsUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Referer': isTv ? `${baseDomain}/embed/tv/${params.id}/${s}/${e}` : `${baseDomain}/embed/movie/${params.id}`,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    timeout: 3300
                });

                const intermediateUrl = r1.data?.src;
                if (!intermediateUrl) continue;

                const r2 = await axios.get(intermediateUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': `${baseDomain}/`
                    },
                    timeout: 3300
                });

                const matchCfg = r2.data.match(/window\.CFG\s*=\s*({[^<]+});/);
                if (!matchCfg) continue;
                const cfg = JSON.parse(matchCfg[1]);
                const playerUrl = new URL(cfg.playerUrl, intermediateUrl).href;

                const r3 = await axios.get(playerUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': intermediateUrl
                    },
                    timeout: 3300
                });

                const matchPlayerCfg = r3.data.match(/window\.CONFIG\s*=\s*({[^<]+});/);
                if (!matchPlayerCfg) continue;
                const pCfg = JSON.parse(matchPlayerCfg[1]);

                const baseApi = pCfg.api || `${pCfg.streamBase}&season=${pCfg.season || s}&episode=${pCfg.episode || e}&stream_urls`;
                const targetApiUrl = `${baseApi}&api_token=${encodeURIComponent(pCfg.apiToken || '')}`;

                const r4 = await axios.get(targetApiUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': playerUrl
                    },
                    timeout: 3300
                });

                const j = r4.data;
                if (j.vs && j.data && typeof j.data.stream_urls === 'string') {
                    const wasmBytes = (await axios.get(j.vs.wasm_url, { responseType: 'arraybuffer', timeout: 8000 })).data;
                    const mod = await WebAssembly.compile(wasmBytes);
                    const inst: any = await WebAssembly.instantiate(mod, {});
                    const ex = inst.exports;
                    const enc = Buffer.from(j.data.stream_urls, 'base64');
                    const ptr = ex.alloc(enc.length);
                    new Uint8Array(ex.memory.buffer, ptr, enc.length).set(enc);
                    const outLen = ex.decrypt(ptr, enc.length);
                    const decrypted = new TextDecoder().decode(new Uint8Array(ex.memory.buffer, ptr + 12, outLen));
                    rawUrls = decrypted.split('\n').map((u: string) => u.trim()).filter(Boolean);
                } else if (Array.isArray(j.data?.stream_urls)) {
                    rawUrls = j.data.stream_urls;
                }

                // Authenticate stream URLs with just-in-time session tokens from stream host
                if (rawUrls.length > 0) {
                    if (pCfg.apiToken) {
                        const authenticatedUrls: string[] = [];
                        for (const raw of rawUrls) {
                            try {
                                const origin = new URL(raw).origin;
                                const tokenUrl = `${origin}/generate.php?api_token=${encodeURIComponent(pCfg.apiToken)}`;
                                const tokRes = await axios.get(tokenUrl, {
                                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                                    timeout: 3000
                                });
                                let token = String(tokRes.data || '').trim();
                                try {
                                    const parsed = JSON.parse(token);
                                    token = parsed.token || parsed.data || parsed.string || parsed.result || token;
                                } catch (_) {}
                                if (token) {
                                    authenticatedUrls.push(raw + (raw.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token));
                                } else {
                                    authenticatedUrls.push(raw);
                                }
                            } catch (_) {
                                authenticatedUrls.push(raw);
                            }
                        }
                        rawUrls = authenticatedUrls;
                    }
                }

                if (Array.isArray(j.data?.subtitles) || Array.isArray(j.default_subs)) {
                    subtitlesList = (j.data?.subtitles || j.default_subs || []).map((sub: any) => ({
                        lang: sub.lang || sub.label || 'en',
                        url: sub.url,
                        label: sub.label || sub.lang || 'English'
                    }));
                }

                if (rawUrls.length > 0) break;
            } catch (_) {}
        }

        const sources: any[] = [];
        for (let i = 0; i < rawUrls.length; i++) {
            const raw = rawUrls[i];
            if (raw.startsWith('http')) {
                sources.push({
                    url: `/stream_proxy.php?url=${encodeURIComponent(raw)}`,
                    rawUrl: raw,
                    directUrl: raw,
                    quality: '1080p',
                    type: 'application/x-mpegurl',
                    label: `VidSrc Multi-Source 1080p #${i + 1}`,
                    provider: 'vidsrc',
                    isEmbed: false,
                    isDirectM3u: true,
                    skipProxy: false
                });
            }
        }

        if (sources.length === 0) {
            const fallbackEmbed = isTv
                ? `https://vidsrc.pm/embed/tv/${params.id}/${s}/${e}`
                : `https://vidsrc.pm/embed/movie/${params.id}`;
            sources.push({
                url: fallbackEmbed,
                rawUrl: fallbackEmbed,
                quality: '1080p',
                type: 'embed',
                label: 'VidSrc VIP (Official Embed)',
                provider: 'vidsrc',
                isEmbed: true,
                isDirectM3u: false
            });
        }

        return {
            success: sources.length > 0,
            sources,
            subtitles: subtitlesList,
            primaryM3u8: sources[0]?.url
        };
    } catch (e: any) {
        console.warn('[VidSrc Scraper Error]:', e?.message || e);
    }
    return { success: false, sources: [], subtitles: [] };
}

// ==========================================
// 🚀 2EMBED NATIVE M3U SCRAPER & RESOLVER (PURE STREAMS)
// ==========================================
export async function scrape2EmbedStream(params: {
    tmdbId: string | number;
    type: 'movie' | 'tv' | 'anime';
    season?: number;
    episode?: number;
}): Promise<any> {
    try {
        const s = params.season || 1;
        const e = params.episode || 1;
        const isTv = params.type === 'tv' || params.type === 'anime';
        const embedUrl = isTv
            ? `https://www.2embed.cc/embedtv/${params.tmdbId}&s=${s}&e=${e}`
            : `https://www.2embed.cc/embed/${params.tmdbId}`;

        const res = await axios.get(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Referer': 'https://www.2embed.cc/'
            },
            timeout: 5000
        });

        const html = String(res.data || '');
        const candidateUrls: string[] = [];

        const dataSrcMatch = html.match(/data-src=["'](https?:\/\/[^"']+)["']/i) ||
                             html.match(/<iframe[^>]+id=["']iframesrc["'][^>]+src=["'](https?:\/\/[^"']+)["']/i);
        if (dataSrcMatch && dataSrcMatch[1]) {
            candidateUrls.push(dataSrcMatch[1]);
        }

        const onclickMatches = html.matchAll(/onclick=["']go\(['"](https?:\/\/[^'"]+)['"]\)["']/gi);
        for (const m of onclickMatches) {
            if (m[1] && !candidateUrls.includes(m[1])) {
                candidateUrls.push(m[1]);
            }
        }

        const sources: any[] = [];
        const subtitlesList: any[] = [];

        // Concurrently attempt stream extraction from top candidate targets
        await Promise.allSettled(candidateUrls.slice(0, 3).map(async (targetUrl) => {
            try {
                const targetRes = await axios.get(targetUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': embedUrl
                    },
                    timeout: 4500
                });
                const targetHtml = String(targetRes.data || '');

                // Strategy 1: VidSrc.buzz / Videm.buzz API handshake
                if (targetUrl.includes('vidsrc.buzz') || targetUrl.includes('videm.buzz') || targetHtml.includes('vidsrc.buzz') || targetHtml.includes('var Q')) {
                    const qMatch = targetHtml.match(/var\s+Q\s*=\s*(\{[\s\S]*?\});/);
                    if (qMatch) {
                        try {
                            const Q = JSON.parse(qMatch[1]);
                            if (Q.t && Q.id) {
                                const qs = `type=${Q.type || (isTv ? 'tv' : 'movie')}&id=${encodeURIComponent(Q.id)}&s=${Q.s || (isTv ? s : 0)}&e=${Q.e || (isTv ? e : 0)}&t=${encodeURIComponent(Q.t)}`;
                                const srvDomain = targetUrl.includes('videm.buzz') ? 'https://videm.buzz' : 'https://vidsrc.buzz';
                                const sRes = await axios.get(`${srvDomain}/pl/api.php?a=sources&${qs}`, {
                                    headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                        'Referer': targetUrl
                                    },
                                    timeout: 4000
                                });

                                const srvList = Array.isArray(sRes.data?.servers) ? sRes.data.servers : [];
                                for (const srv of srvList.slice(0, 2)) {
                                    if (!srv.ref) continue;
                                    try {
                                        const playRes = await axios.get(`${srvDomain}/pl/api.php?a=play&ref=${encodeURIComponent(srv.ref)}&t=${encodeURIComponent(Q.t)}`, {
                                            headers: {
                                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                                'Referer': targetUrl
                                            },
                                            timeout: 4000
                                        });

                                        if (playRes.data && playRes.data.url) {
                                            const streamRel = String(playRes.data.url);
                                            if (streamRel.includes('cap.php')) continue;
                                            const directM3u = streamRel.startsWith('http') ? streamRel : `${srvDomain}${streamRel}`;
                                            sources.push({
                                                url: `/stream_proxy.php?url=${encodeURIComponent(directM3u)}&referer=${encodeURIComponent(`${srvDomain}/`)}`,
                                                rawUrl: directM3u,
                                                directUrl: directM3u,
                                                quality: '1080p',
                                                type: 'application/x-mpegurl',
                                                label: `2Embed (${srv.name || 'VidSrc Direct HLS'})`,
                                                provider: 'two_embed',
                                                isDirectM3u: true,
                                                referrer: `${srvDomain}/`,
                                                skipProxy: false
                                            });
                                        }
                                    } catch (_) {}
                                }
                            }
                        } catch (_) {}
                    }
                }

                // Strategy 2: Swish / 2vCDN / streamsrcs unpacker
                if (targetUrl.includes('swish') || targetUrl.includes('streamsrcs') || targetHtml.includes('framesrc') || targetHtml.includes('2vcdn.skin')) {
                    const frameMatch = targetHtml.match(/id=["']?framesrc["']?[^>]*src=["']?([^"'\s>]+)/is) ||
                                       targetHtml.match(/src=["']?([^"'\s>]+)["']?[^>]*id=["']?framesrc["']/is);
                    if (frameMatch && frameMatch[1]) {
                        const fileCode = frameMatch[1].replace(/.*\/e\//, '').trim();
                        const cdnUrl = `https://2vcdn.skin/e/${fileCode}`;
                        const cdnRes = await axios.get(cdnUrl, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Referer': targetUrl
                            },
                            timeout: 4500
                        });
                        const cdnHtml = String(cdnRes.data || '');
                        const packerMatch = cdnHtml.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?\.split\('\|'\)\)\)/);
                        if (packerMatch) {
                            const matchArgs = packerMatch[0].match(/}\s*\(\s*'(.*)',\s*(\d+),\s*(\d+),\s*'(.*?)'\.split\('\|'\)/s);
                            if (matchArgs) {
                                let p = matchArgs[1];
                                const a = parseInt(matchArgs[2], 10);
                                let c = parseInt(matchArgs[3], 10);
                                const k = matchArgs[4].split('|');
                                while (c--) {
                                    if (k[c]) p = p.replace(new RegExp('\\b' + c.toString(a) + '\\b', 'g'), k[c]);
                                }

                                const hls2Match = p.match(/["']hls2["']\s*:\s*["']([^"']+)["']/);
                                const hls3Match = p.match(/["']hls3["']\s*:\s*["']([^"']+)["']/);
                                const hls4Match = p.match(/["']hls4["']\s*:\s*["']([^"']+)["']/);

                                const directM3u = (hls2Match && hls2Match[1]) || (hls3Match && hls3Match[1]);
                                const streamRel = (hls4Match && hls4Match[1]);

                                if (directM3u && directM3u.startsWith('http')) {
                                    sources.push({
                                        url: `/stream_proxy.php?url=${encodeURIComponent(directM3u)}&referer=${encodeURIComponent('https://2vcdn.skin/')}`,
                                        rawUrl: directM3u,
                                        directUrl: directM3u,
                                        quality: '1080p',
                                        type: 'application/x-mpegurl',
                                        label: '2Embed 2vCDN (Direct High-Speed HLS)',
                                        provider: 'two_embed',
                                        isDirectM3u: true,
                                        referrer: 'https://2vcdn.skin/',
                                        skipProxy: false
                                    });
                                }

                                if (streamRel) {
                                    const fullRel = streamRel.startsWith('http') ? streamRel : `https://2vcdn.skin${streamRel}`;
                                    sources.push({
                                        url: `/stream_proxy.php?url=${encodeURIComponent(fullRel)}&referer=${encodeURIComponent('https://2vcdn.skin/')}`,
                                        rawUrl: fullRel,
                                        directUrl: fullRel,
                                        quality: '720p',
                                        type: 'application/x-mpegurl',
                                        label: '2Embed Swish (Relay Stream)',
                                        provider: 'two_embed',
                                        isDirectM3u: true,
                                        referrer: 'https://2vcdn.skin/',
                                        skipProxy: false
                                    });
                                }

                                const vttMatches = p.match(/https?:\/\/[^\s"'<>]+\.vtt[^\s"'<>]*/g) || [];
                                for (const vtt of vttMatches) {
                                    const langMatch = vtt.match(/_([a-z]{3})\.vtt/i);
                                    const langCode = langMatch ? langMatch[1].toLowerCase() : 'en';
                                    subtitlesList.push({
                                        lang: langCode,
                                        url: vtt,
                                        label: langCode.toUpperCase()
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (_) {}
        }));

        if (sources.length === 0) {
            sources.push({
                url: embedUrl,
                rawUrl: embedUrl,
                quality: '1080p',
                type: 'embed',
                label: '2Embed (Official Embed)',
                provider: 'two_embed',
                isEmbed: true,
                isDirectM3u: false,
                referrer: 'https://www.2embed.cc/'
            });
        }

        return {
            success: sources.length > 0,
            sources,
            subtitles: subtitlesList,
            primaryM3u8: sources[0]?.url
        };
    } catch (e: any) {
        console.warn('[2Embed Scraper Error]:', e?.message || e);
    }
    return { success: false, sources: [], subtitles: [] };
}

// ==========================================
// 🚀 SMASHYSTREAM NATIVE M3U SCRAPER & RESOLVER (PURE STREAMS)
// ==========================================
export async function scrapeSmashyStream(params: {
    tmdbId: string | number;
    type: 'movie' | 'tv' | 'anime';
    season?: number;
    episode?: number;
}): Promise<any> {
    try {
        const s = params.season || 1;
        const e = params.episode || 1;
        const isTv = params.type === 'tv' || params.type === 'anime';
        const targetUrl = isTv
            ? `https://embed.smashystream.com/playere.php?tmdb=${params.tmdbId}&season=${s}&episode=${e}`
            : `https://embed.smashystream.com/playere.php?tmdb=${params.tmdbId}`;

        const res = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Referer': 'https://smashystream.xyz/'
            },
            timeout: 5000
        });

        const html = String(res.data || '');
        const sources: any[] = [];
        const subtitlesList: any[] = [];

        const m3uMatches = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/g) || [];
        for (const m3u of m3uMatches) {
            sources.push({
                url: `/stream_proxy.php?url=${encodeURIComponent(m3u)}`,
                rawUrl: m3u,
                directUrl: m3u,
                quality: '1080p',
                type: 'application/x-mpegurl',
                label: 'SmashyStream Fast HLS',
                provider: 'smashy',
                isDirectM3u: true,
                skipProxy: false
            });
        }

        return {
            success: sources.length > 0,
            sources,
            subtitles: subtitlesList,
            primaryM3u8: sources[0]?.url
        };
    } catch (e: any) {
        console.warn('[SmashyStream Scraper Error]:', e?.message || e);
    }
    return { success: false, sources: [], subtitles: [] };
}

// ==========================================
// 🚀 ANIEMBED NATIVE DUAL AUDIO HLS SCRAPER (PURE STREAMS)
// ==========================================
export async function scrapeAniEmbedStream(params: {
    id: string | number;
    type?: 'movie' | 'tv' | 'anime';
    episode?: number;
    anilistId?: string | number;
}): Promise<any> {
    try {
        const ep = params.episode || 1;
        const aniId = params.anilistId || params.id;
        const embedUrl = `https://aniembed.se/e/${aniId}/${ep}`;

        const sources: any[] = [];
        let subtitlesList: any[] = [];

        let animeSlug: string | null = null;
        try {
            const res = await axios.get(embedUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                    'Referer': 'https://aniembed.se/'
                },
                timeout: 5000
            });
            const html = String(res.data || '');
            const idMatch = html.match(/(?:["']id["']|(?<![\w$])id)\s*:\s*["']([^"']+)["'],\s*(?:["']anilistId["']|(?<![\w$])anilistId)/i) ||
                            html.match(/data\s*:\s*\{[^}]*(?:["']id["']|(?<![\w$])id)\s*:\s*["']([^"']+)["']/i) ||
                            html.match(/id\s*:\s*["']([a-zA-Z0-9_\-]+)["'],\s*anilistId\s*:\s*\d+/i);
            if (idMatch) animeSlug = idMatch[1];
        } catch (_) {}

        if (!animeSlug && typeof aniId === 'string' && isNaN(Number(aniId))) {
            animeSlug = aniId;
        }

        if (animeSlug) {
            try {
                // Fetch Japanese Sub & English Dub in parallel from Animex API
                const [subRes, dubRes] = await Promise.all([
                    axios.get(`https://pp.animex.one/rest/api/sources?id=${encodeURIComponent(animeSlug)}&epNum=${ep}&type=sub&providerId=nero`, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': 'https://aniembed.se/'
                        },
                        timeout: 5000
                    }).catch(() => null),
                    axios.get(`https://pp.animex.one/rest/api/sources?id=${encodeURIComponent(animeSlug)}&epNum=${ep}&type=dub&providerId=nero`, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': 'https://aniembed.se/'
                        },
                        timeout: 5000
                    }).catch(() => null)
                ]);

                // Japanese Subtitle Stream
                if (subRes?.data?.sources && Array.isArray(subRes.data.sources)) {
                    for (const s of subRes.data.sources) {
                        if (s.url && (s.url.includes('.txt') || s.url.includes('.m3u8'))) {
                            sources.push({
                                url: `/stream_proxy.php?url=${encodeURIComponent(s.url)}&referer=${encodeURIComponent('https://animex.one/')}`,
                                rawUrl: s.url,
                                directUrl: s.url,
                                quality: '1080p Sub',
                                type: 'application/x-mpegurl',
                                label: 'AniEmbed Sub (Megavid Direct HLS)',
                                provider: 'aniembed',
                                isDirectM3u: true,
                                referrer: subRes.data.headers?.Referer || 'https://animex.one/',
                                skipProxy: false
                            });
                        }
                    }
                }

                // English Dub Stream
                if (dubRes?.data?.sources && Array.isArray(dubRes.data.sources)) {
                    for (const s of dubRes.data.sources) {
                        if (s.url && (s.url.includes('.txt') || s.url.includes('.m3u8'))) {
                            sources.push({
                                url: `/stream_proxy.php?url=${encodeURIComponent(s.url)}&referer=${encodeURIComponent('https://animex.one/')}`,
                                rawUrl: s.url,
                                directUrl: s.url,
                                quality: '1080p English Dub',
                                type: 'application/x-mpegurl',
                                label: 'AniEmbed English Dub (Megavid Direct HLS)',
                                provider: 'aniembed',
                                isDirectM3u: true,
                                referrer: dubRes.data.headers?.Referer || 'https://animex.one/',
                                skipProxy: false
                            });
                        }
                    }
                }

                // Collect Subtitles
                const tracks = dubRes?.data?.tracks || subRes?.data?.tracks;
                if (tracks && Array.isArray(tracks)) {
                    for (const t of tracks) {
                        if (t.url && t.label) {
                            subtitlesList.push({
                                lang: t.lang || 'en',
                                label: t.label,
                                url: t.url,
                                default: !!t.default
                            });
                        }
                    }
                }
            } catch (_) {}
        }

        // Return direct streams if resolved. If direct manifests are unreachable, only offer embed mode
        if (sources.length === 0) {
            sources.push({
                url: embedUrl,
                quality: '1080p Dual Audio',
                type: 'embed',
                label: 'AniEmbed Player',
                provider: 'aniembed',
                skipProxy: true
            });
        }

        return {
            success: sources.length > 0,
            sources,
            subtitles: subtitlesList,
            primaryM3u8: (sources[0]?.type !== 'embed') ? sources[0]?.url : undefined
        };
    } catch (e: any) {
        console.warn('[AniEmbed Scraper Error]:', e?.message || e);
    }
    return { success: false, sources: [], subtitles: [] };
}

// ==========================================
// 🚀 ZANIX ANIME SCRAPER (FLIXERA & NOVUSCLOUD)
// ==========================================
export async function scrapeZanixStream(params: {
    id: string | number;
    type?: 'movie' | 'tv' | 'anime';
    season?: number;
    episode?: number;
    anilistId?: string | number;
    malId?: string | number;
    title?: string;
}): Promise<any> {
    try {
        const ep = params.episode || 1;
        const s = params.season || 1;
        const aniId = params.anilistId || params.id;
        const sources: any[] = [];

        // Server 1: VidSrc PM Embed (Rock-solid for Movies, TV & Anime)
        const vidsrcUrl = (params.type === 'movie')
            ? `https://vidsrc.pm/embed/movie/${params.id}`
            : `https://vidsrc.pm/embed/tv/${params.id}/${s}/${ep}`;
        sources.push({
            url: vidsrcUrl,
            quality: '1080p Ultra HD',
            type: 'embed',
            label: 'Zanix VidSrc VIP (Ultra HD)',
            provider: 'zanix',
            skipProxy: true
        });

        // Server 2: AniEmbed Direct (Dual Audio JP/EN)
        // AniEmbed embed removed per user specification

        // Server 3: 2Embed CC
        const twoEmbedUrl = (params.type === 'movie')
            ? `https://www.2embed.cc/embed/${params.id}`
            : `https://www.2embed.cc/embedtv/${params.id}&s=${s}&e=${ep}`;
        sources.push({
            url: twoEmbedUrl,
            quality: '1080p Multi-Audio',
            type: 'embed',
            label: 'Zanix 2Embed (Multi-Audio)',
            provider: 'zanix',
            skipProxy: true
        });

        return {
            success: sources.length > 0,
            sources,
            subtitles: [],
            primaryM3u8: undefined
        };
    } catch (_) {
        return { success: false, sources: [], subtitles: [] };
    }
}

// ==========================================
// 🚀 FLUX MOVIES & ANIME SCRAPER (AUTOEMBED & VIDLINK)
// ==========================================
export async function scrapeFluxStream(params: {
    tmdbId: string | number;
    type: 'movie' | 'tv' | 'anime';
    season?: number;
    episode?: number;
}): Promise<any> {
    try {
        const s = params.season || 1;
        const e = params.episode || 1;
        const isTv = params.type === 'tv' || params.type === 'anime';
        const sources: any[] = [];

        // Primary: AutoEmbed (Fast CDN Embed)
        const autoEmbedUrl = isTv
            ? `https://autoembed.co/tv/tmdb/${params.tmdbId}-${s}-${e}`
            : `https://autoembed.co/movie/tmdb/${params.tmdbId}`;
        sources.push({
            url: autoEmbedUrl,
            quality: '1080p HD',
            type: 'embed',
            label: 'Flux AutoEmbed (1080p)',
            provider: 'flux',
            skipProxy: true
        });

        // Backup: VidLink Pro Embed
        const vidlinkUrl = isTv
            ? `https://vidlink.pro/tv/${params.tmdbId}/${s}/${e}?multiLang=true&sub=true`
            : `https://vidlink.pro/movie/${params.tmdbId}?multiLang=true&sub=true`;
        sources.push({
            url: vidlinkUrl,
            quality: '1080p Pro',
            type: 'embed',
            label: 'Flux VidLink (Pro Embed)',
            provider: 'flux',
            skipProxy: true
        });

        return {
            success: sources.length > 0,
            sources,
            subtitles: [],
            primaryM3u8: undefined
        };
    } catch (_) {
        return { success: false, sources: [], subtitles: [] };
    }
}


// ==========================================
// 🚀 BINGR.ONE NEXTGEN (v1 RSC KEYSTREAM CIPHER)
// ==========================================
const BINGR_KEY = "vY7#qL2!mZ9@wK4$";

export function decryptBingrPayload(e: string): any {
    if (!e || !e.startsWith("v1.")) throw new Error("bad payload");
    const b64 = e.slice(3).replace(/-/g, "+").replace(/_/g, "/");
    const bin = Buffer.from(b64, 'base64');
    const arr = new Uint8Array(bin);
    const nonce = arr.subarray(0, 12);
    const data = arr.slice(12);

    function getKeyStream(nonceBytes: Uint8Array): number[] {
        const t: number[] = [];
        for (let n = 0; n < 4; n++) {
            let l = (0x811c9dc5 ^ (0x9e3779b9 * n)) >>> 0;
            for (let i = 0; i < BINGR_KEY.length; i++) {
                l = Math.imul(l ^ BINGR_KEY.charCodeAt(i), 0x1000193) >>> 0;
            }
            for (let i = 0; i < nonceBytes.length; i++) {
                l = Math.imul(l ^ nonceBytes[i], 0x1000193) >>> 0;
            }
            t.push(l);
        }
        return t;
    }

    let [n, l, a, s] = getKeyStream(nonce);
    let i = 0;
    for (let t = 0; t < data.length; t++) {
        if ((3 & t) === 0) {
            a >>>= 0;
            s >>>= 0;
            let e = (n >>>= 0) + (l >>>= 0) | 0;
            n = l ^ (l >>> 9);
            l = a + (a << 3) | 0;
            a = ((a << 21 | a >>> 11) + (e = (e + (s = s + 1 | 0) | 0))) | 0;
            i = e >>> 0;
        }
        data[t] ^= (i >>> ((3 & t) * 8)) & 255;
    }

    return JSON.parse(Buffer.from(data).toString('utf8'));
}

export async function scrapeBingrNextGen(params: {
    tmdbId: number | string;
    type: 'movie' | 'tv' | 'anime';
    season?: number;
    episode?: number;
    provider?: string;
}): Promise<{
    success: boolean;
    provider?: { id: string; label: string; tag?: string };
    servers?: Array<{ id: string; label: string; tag?: string }>;
    streams?: Array<{
        url: string;
        quality?: string;
        language?: string;
        type?: string;
        label?: string;
        subtitles?: Array<{ url: string; lang: string; label?: string }>;
    }>;
    error?: string;
}> {
    const isTv = params.type === 'tv' || (params.type !== 'movie' && params.season !== undefined && Number(params.season) > 0);
    const tmdbId = params.tmdbId;
    const s = params.season || 1;
    const e = params.episode || 1;
    const watchPath = isTv ? `/watch/tv/${tmdbId}/${s}/${e}` : `/watch/movie/${tmdbId}`;
    const watchUrl = `https://bingr.one${watchPath}`;

    try {
        const res = await axios.get(watchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': 'https://bingr.one/'
            },
            timeout: 8000
        });

        const html = res.data || '';
        const tokenMatch = html.match(/\\?"token\\?":\s*\\?"([^\\"]+)\\?"/);
        const token = tokenMatch ? tokenMatch[1] : null;

        const v1Matches = [...html.matchAll(/(v1\.[a-zA-Z0-9_\-]+)/g)].map(m => m[1]);
        let initialData: any = null;
        for (const v1 of v1Matches) {
            try {
                const dec = decryptBingrPayload(v1);
                if (dec && (dec.streams || dec.servers || dec.provider)) {
                    initialData = dec;
                    break;
                }
            } catch (_) {}
        }

        if (!initialData) {
            return { success: false, error: 'Could not decrypt initial Bingr payload' };
        }

        const reqProvider = params.provider;
        const VALID_BINGR_PROVIDERS = ['prism', 'citadel', 'evion', 'flux', 'pulse', 'volt', 'nimbus'];
        const LEGACY_PROVIDER_MAP: Record<string, string> = {
            's30': 'prism',
            'nova': 'prism',
            's62': 'citadel',
            'bastion': 'citadel',
            'baiston': 'citadel',
            's40': 'prism',
            'aphelion': 'prism',
            's80': 'citadel',
            'moscow': 'citadel',
            's31': 'prism',
            'orion': 'prism',
            'ornion': 'prism',
            's3': 'pulse',
            'edmunds': 'pulse',
            'edmedus': 'pulse',
            'edmendus': 'pulse',
            's70': 'prism',
            'polaris': 'prism',
            's81': 'citadel',
            'novo': 'citadel',
            's60': 'evion',
            'vertex': 'evion',
            's63': 'volt',
            'hallyu': 'volt',
            's61': 'nimbus',
            'corvus': 'nimbus',
            'prism': 'prism',
            'citadel': 'citadel',
            'evion': 'evion',
            'flux': 'flux',
            'pulse': 'pulse',
            'volt': 'volt',
            'nimbus': 'nimbus'
        };
        const targetProvider = reqProvider ? (LEGACY_PROVIDER_MAP[reqProvider.toLowerCase()] || reqProvider.toLowerCase()) : undefined;

        if (targetProvider) {
            // Case 1: Target provider matches initialData's provider (e.g. 'prism')
            if (initialData.provider && initialData.provider.id === targetProvider) {
                return { success: true, ...initialData };
            }

            // Case 2: Fetch the specific requested provider
            if (VALID_BINGR_PROVIDERS.includes(targetProvider) && token) {
                try {
                    const sourcesUrl = `https://bingr.one/api/sources?kind=${isTv ? 'tv' : 'movie'}&t=${encodeURIComponent(token)}&provider=${targetProvider}&tmdb=${tmdbId}${isTv ? `&s=${s}&e=${e}` : ''}`;
                    const srcRes = await axios.get(sourcesUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                            'Referer': watchUrl,
                            'Accept': '*/*'
                        },
                        timeout: 8000
                    });
                    if (typeof srcRes.data === 'string' && srcRes.data.startsWith('v1.')) {
                        const providerData = decryptBingrPayload(srcRes.data);
                        if (providerData && providerData.streams && providerData.streams.length > 0) {
                            return { success: true, ...providerData };
                        }
                    }
                } catch (_) {}
            }

            // Zero fake fallbacks: when a specific server is requested and returns 0 streams, report genuine reachability
            return {
                success: false,
                provider: { id: targetProvider, label: targetProvider },
                streams: [],
                error: `Server ${targetProvider} returned 0 active streams on upstream cluster`
            };
        }

        return { success: true, ...initialData };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export const BINGR_SERVERS: BingrServerCluster[] = [
    { id: 'vidlink', name: 'VidLink Pro (Decrypted 1080p / Direct CDN)', cc: 'US', priority: 1 },
    { id: 'vidrift', name: 'Vidrift (Decrypted Multi-Provider HLS)', cc: 'IN', priority: 2 },
    { id: 'm4u', name: 'Movie 4U (Movies4u / Acek CDN)', cc: 'IN', priority: 3 },
    { id: 'prism', name: 'Prism (Multi-Audio 1080p / Direct CDN)', cc: 'GL', priority: 4 },
    { id: 's80', name: 'Moscow (Fast Direct HLS / StreamRip)', cc: 'US', priority: 5 },
    { id: 's30', name: 'Nova (Direct Fast HLS)', cc: 'US', priority: 6 },
    { id: 'filmu', name: 'Filmu / Vidly (Native HLS / Decrypted Stream)', cc: 'IN', priority: 7 },
    { id: 'two_embed', name: '2Embed (Swish / 2vCDN Direct HLS)', cc: 'US', priority: 8 },
    { id: 'smashy', name: 'SmashyStream (Multi-Host / Filemoon & Wish HLS)', cc: 'US', priority: 9 },
    { id: 's62', name: 'Bastion (Multi-Audio HLS / Fast Direct)', cc: 'IN', priority: 10 },
    { id: 'flux', name: 'Flux (VidBinge & SudoFlix Direct 1080p HLS)', cc: 'US', priority: 11 },
    { id: 's31', name: 'Orion (Worker CDN Direct)', cc: 'US', priority: 12 },
    { id: 'sm_hub', name: 'SM Movie Hub Pro (Direct VOD/MKV/Dual Audio)', cc: 'BD', priority: 13 },
    { id: 's70', name: 'Polaris (Multi-Language Dubs / HLS)', cc: 'US', priority: 14 },
    { id: 'framex', name: 'FrameX TV (Multi-Source 4K/1080p Movies, TV & Anime)', cc: 'US', priority: 15 },
    { id: 's81', name: 'Novo (Direct StreamRip / High-Speed HLS)', cc: 'US', priority: 16 },
    { id: 's40', name: 'Aphelion (DarkMatter / Dedicated TV Series HLS)', cc: 'GL', priority: 17 },
    { id: 's3', name: 'Edmunds (High Reliability Proxy / 1080p)', cc: 'US', priority: 18 },
    { id: 'vidsrc', name: 'VidSrc (Universal Multi-Source Streamer)', cc: 'US', priority: 19 },
    { id: 's60', name: 'Vertex (Direct CDN)', cc: 'US', priority: 20 },
    { id: 's63', name: 'Hallyu (Asian & International HLS)', cc: 'KR', priority: 21 },
    { id: 's61', name: 'Corvus (Multi-Source Hub / 1080p)', cc: 'US', priority: 22 },
    { id: 'cinepro', name: 'CinePro Core (OMSS Multi-Provider 4K/1080p)', cc: 'US', priority: 23 },
    { id: 'citadel', name: 'Citadel (Multi-Audio HLS / StreamRip)', cc: 'US', priority: 24 },
    { id: 'evion', name: 'Edge (HD Direct Stream)', cc: 'US', priority: 25 },
    { id: 'pulse', name: 'Pulse (HD Direct Stream)', cc: 'US', priority: 26 },
    { id: 'volt', name: 'Volt (HD Direct Stream)', cc: 'US', priority: 27 },
    { id: 'nimbus', name: 'Nimbus (HD Direct Stream)', cc: 'US', priority: 28 },
    { id: 'zanix', name: 'Zanix Anime (FlixEra & NovusCloud Multi-Audio)', cc: 'TR', priority: 30 },
    { id: 'megaplay_buzz', name: 'MegaPlay Buzz (Direct Multi-Bitrate HLS)', cc: 'GL', priority: 1 },
    { id: 'animepahe', name: 'AnimePahe (Direct Google CDN MP4)', cc: 'JP', priority: 2 },
    { id: 'bing_anime', name: 'Bing Anime (Multi-Audio HLS & Direct)', cc: 'JP', priority: 3 },
    { id: 'anivexa', name: 'Kitsune Anivexa (Multi-Engine 1080p)', cc: 'JP', priority: 4 },
    { id: 'reanime', name: 'ReAnime FlixCloud (1080p Decrypted & Subs)', cc: 'JP', priority: 5 },
    { id: 'moviebox', name: 'MovieBox Online (Direct CDN MP4)', cc: 'US', priority: 4 },
    { id: 'tokyoinsider', name: 'TokyoInsider (Direct 1080p MP4 / High-Speed CDN)', cc: 'JP', priority: 5 },
    { id: 'hianime', name: 'HiAnime (MegaPlay Anime Scraper)', cc: 'JP', priority: 24 },
    { id: 'animesalt', name: 'AnimeSalt (Special Anime Scraper)', cc: 'JP', priority: 25 },
    { id: 'asiaflix', name: 'Asiaflix (Vidmoly Multi-Bitrate HLS)', cc: 'KR', priority: 26 },
    { id: 'kisskh', name: 'KissKH (Asian Drama & Anime)', cc: 'JP', priority: 27 },
    { id: 'cinezo', name: 'Cinezo (Player Cinezo Multi-Audio)', cc: 'FR', priority: 28 },
    { id: 'vidbolt', name: 'Vidbolt (Vidbolt Embed Streamer)', cc: 'US', priority: 29 },
    { id: 'vidy', name: 'Vidy (Vidy.st Direct Embed)', cc: 'US', priority: 30 },
    { id: 's71', name: 'Phoenix (US Cluster)', cc: 'US', priority: 31 },
    { id: 's72', name: 'Paris (IT Cluster)', cc: 'IT', priority: 32 },
    { id: 's50', name: 'Delta (US Cluster)', cc: 'US', priority: 33 },
    { id: 's51', name: 'Delta+ (IN Cluster)', cc: 'IN', priority: 34 },
    { id: 's12', name: 'Quasar (GL Cluster)', cc: 'GL', priority: 35 },
    { id: 's11', name: 'Sirius (GL Cluster)', cc: 'GL', priority: 36 },
    { id: 's1', name: 'Miller (US Cluster)', cc: 'US', priority: 34 },
    { id: 's2', name: 'Mann (US Cluster)', cc: 'US', priority: 35 },
    { id: 's4', name: 'Luna (US Cluster)', cc: 'US', priority: 36 },
    { id: 's5', name: 'Aditya (IN Cluster)', cc: 'IN', priority: 37 }
];

// In-memory stream and details cache
const STREAM_CACHE = new Map<string, { timestamp: number; result: BingrScrapeResult }>();
const DETAILS_CACHE = new Map<string, { timestamp: number; data: BingrMediaDetails }>();
const CACHE_TTL_STREAM = 10 * 60 * 1000; // 10 minutes
const CACHE_TTL_DETAILS = 60 * 60 * 1000; // 1 hour

/**
 * Deep check to detect if a manifest is actually just storyboard thumbnail scrub tiles (.vtt / spritesheet)
 * Note: Genuine DarkMatter/Fetchbox video streams name their MPEG-TS chunks .jpg/.png or playlist tiles.m3u8,
 * which are real 1080p video streams with 0x47 sync bytes and must NEVER be rejected here.
 */
export async function isStoryboardStream(url: string): Promise<boolean> {
    if (!url) return false;
    const lower = url.toLowerCase();
    // Only reject pure sprite/vtt thumbnail tracks (e.g. spritesheet.jpg or scrubber.vtt)
    if (lower.includes('thumbnails.vtt') || lower.includes('spritesheet') || lower.includes('sprite.vtt')) {
        return true;
    }
    return false;
}

/**
 * Fast stream probe to verify upstream is alive and returns HTTP 200..399
 */
export async function verifyStreamReachable(url: string, timeoutMs: number = 2500): Promise<boolean> {
    if (!url) return false;
    let target = url;
    let customRef: string | null = null;
    if (url.startsWith('/api/') || url.startsWith('/')) {
        try {
            const parsed = new URL(url, 'http://localhost:3000');
            const inner = parsed.searchParams.get('url') || parsed.searchParams.get('u');
            customRef = parsed.searchParams.get('referer') || parsed.searchParams.get('ref');
            if (inner && inner.startsWith('http')) {
                target = inner;
            } else {
                return true;
            }
        } catch {
            return true;
        }
    }
    if (!target.startsWith('http')) return false;
    if (
        target.includes('vidsrc.buzz/_stream') || 
        target.includes('videm.buzz/_stream') ||
        target.includes('net52.cc') ||
        target.includes('net22.cc') ||
        target.includes('nm-cdn')
    ) {
        return true;
    }

    const headers = getCdnHeaders(target);
    const effectiveReferer = customRef || headers.referer;
    let extraApiKey: string | undefined;
    if (target.includes('filmu.in') && target.includes('/proxy/')) {
        try {
            extraApiKey = await getMegaPlayToken();
        } catch (_) {}
    }

    return new Promise((resolve) => {
        try {
            const u = new URL(target);
            const isHttps = u.protocol === 'https:';
            const client = isHttps ? https : http;

            const req = client.request({
                hostname: u.hostname,
                port: u.port || (isHttps ? 443 : 80),
                path: u.pathname + u.search,
                method: 'GET',
                headers: {
                    'User-Agent': headers.userAgent,
                    ...(effectiveReferer ? { 'Referer': effectiveReferer } : {}),
                    ...(headers.origin ? { 'Origin': headers.origin } : {}),
                    ...(extraApiKey ? { 'x-api-key': extraApiKey } : {}),
                    ...(u.pathname.endsWith('.mp4') || u.pathname.endsWith('.mkv') || u.pathname.endsWith('.webm') ? { 'Range': 'bytes=0-1024' } : {}),
                    'Accept': '*/*'
                },
                timeout: timeoutMs
            }, (res) => {
                const code = res.statusCode || 0;
                res.destroy();
                resolve((code >= 200 && code < 400) || code === 416 || code === 429);
            });
            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            req.end();
        } catch {
            resolve(false);
        }
    });
}

export interface BingrCastMember {
    id?: number;
    name: string;
    character: string;
    photo?: string;
}

export interface BingrMediaDetails {
    id: number;
    type: 'movie' | 'tv';
    title: string;
    year?: string;
    poster?: string;
    backdrop?: string;
    backdrop_original?: string;
    rating?: number;
    overview?: string;
    runtime?: number;
    genres?: Array<{ id: number; name: string } | string>;
    certification?: string;
    director?: string;
    directors?: string[];
    cast?: BingrCastMember[];
    seasons?: Array<{ season: number; episodes: number }>;
    release_date?: string;
    status?: string;
    trailer?: string;
}

export interface BingrEpisode {
    episode: number;
    title: string;
    overview?: string;
    still?: string;
    air_date?: string;
    rating?: number;
}

export interface BingrStreamSource {
    url: string;
    quality: string;
    type: string;
    label?: string;
    name?: string;
    language?: string;
    rawUrl?: string;
    directUrl?: string;
    referrer?: string;
    proxyUrl?: string;
    skipProxy?: boolean;
    headers?: Record<string, string>;
    audioTracks?: any[];
    isDub?: boolean;
    audio?: string;
}

export interface BingrScrapeResult {
    success: boolean;
    type: 'movie' | 'tv' | 'anime';
    tmdbId: number;
    title?: string;
    year?: string;
    season?: number;
    episode?: number;
    serverId?: string;
    serverName?: string;
    scraperName?: string;
    primaryM3u8?: string;
    quality?: string;
    sources: BingrStreamSource[];
    subtitles?: Array<{ lang: string; url: string; label?: string }>;
    attempts?: Array<{ serverId: string; serverName: string; status: string; latencyMs: number; error?: string }>;
    fallbackEmbeds?: string[];
    fallbackNote?: string;
    error?: string;
    expectedDurationMinutes?: number;
    streamDurationMinutes?: number;
    streamDurationSec?: number;
    duration?: number;
    audioTracks?: Array<{ index: number; streamIndex: number; codec: string; language: string; label: string }>;
}

const BINGR_API_BASE = 'https://api.bingr.one/api';

/**
 * Universal HTTPS request with Bingr anti-bot and Origin/Referer bypass headers
 */
export function bingrRequest<T = any>(pathname: string, options: {
    method?: string;
    body?: any;
    referer?: string;
    origin?: string;
    timeout?: number;
} = {}): Promise<{ status: number; data: T }> {
    return new Promise((resolve, reject) => {
        const fullUrl = pathname.startsWith('http') ? pathname : `${BINGR_API_BASE}${pathname}`;
        const u = new URL(fullUrl);
        const postData = options.body ? JSON.stringify(options.body) : null;
        
        const defaultOrigin = options.referer ? new URL(options.referer).origin : 'https://bingr.one';
        const req = https.request({
            hostname: u.hostname,
            port: 443,
            path: u.pathname + u.search,
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': options.referer || 'https://bingr.one/',
                'Origin': options.origin || defaultOrigin,
                'Accept': 'application/json, text/plain, */*',
                ...(postData ? {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                } : {})
            },
            timeout: options.timeout || 12000
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode || 200, data: json });
                } catch {
                    resolve({ status: res.statusCode || 200, data: body as any });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Request timed out to ${u.pathname}`));
        });

        if (postData) req.write(postData);
        req.end();
    });
}

export const TMDB_KEYS: string[] = [
    '9d83476d2e27f56748167514c69cd2b4',
    '15d2ea6d0dc1d476efbca3eba2b9bbfb',
    'a07e22bc18f5cb106bfe4cc1f83ad8ed'
];

let rotatingTmdbKeyIdx = 0;

export function getTmdbKeys(): string[] {
    return TMDB_KEYS;
}

export function getRotatingTmdbKey(): string {
    const key = TMDB_KEYS[rotatingTmdbKeyIdx % TMDB_KEYS.length];
    rotatingTmdbKeyIdx = (rotatingTmdbKeyIdx + 1) % TMDB_KEYS.length;
    return key;
}

export const ROTATING_TMDB_KEYS = TMDB_KEYS;

/**
 * Resolve IMDb ID (tt...) to TMDB ID using rotating keys
 */
export async function resolveImdbToTmdbId(imdbId: string): Promise<{ tmdbId: number; type: 'movie' | 'tv'; title?: string; year?: string } | null> {
    if (!imdbId || typeof imdbId !== 'string' || !imdbId.trim().startsWith('tt')) return null;
    const cleanImdb = imdbId.trim();
    for (let attempt = 0; attempt < ROTATING_TMDB_KEYS.length; attempt++) {
        const apiKey = getRotatingTmdbKey();
        try {
            const url = `https://api.themoviedb.org/3/find/${cleanImdb}?api_key=${apiKey}&external_source=imdb_id`;
            const res = await axios.get(url, { timeout: 4000, httpsAgent: tmdbAgent });
            if (res.data?.movie_results && res.data.movie_results.length > 0) {
                const mov = res.data.movie_results[0];
                return {
                    tmdbId: mov.id,
                    type: 'movie',
                    title: mov.title,
                    year: (mov.release_date || '').slice(0, 4)
                };
            }
            if (res.data?.tv_results && res.data.tv_results.length > 0) {
                const tv = res.data.tv_results[0];
                return {
                    tmdbId: tv.id,
                    type: 'tv',
                    title: tv.name || tv.title,
                    year: (tv.first_air_date || '').slice(0, 4)
                };
            }
        } catch (_) {}
    }
    return null;
}

/**
 * Search Movies & TV Shows via Bingr / TMDB Gateway
 */
export async function searchBingr(query: string): Promise<any> {
    if (!query || !query.trim()) return { results: [] };
    const clean = query.trim();

    // Direct numeric TMDB ID check
    if (/^\d+$/.test(clean)) {
        try {
            const movie = await getMovieDetails(clean);
            if (movie && movie.id) return { results: [movie], isDirectTmdb: true };
        } catch {}
        try {
            const tv = await getTvDetails(clean);
            if (tv && tv.id) return { results: [tv], isDirectTmdb: true };
        } catch {}
    }

    let results: any[] = [];
    try {
        const res = await bingrRequest(`/search?q=${encodeURIComponent(clean)}`);
        const data = res.data || { results: [] };
        if (Array.isArray(data.results)) {
            results = data.results;
        }
    } catch (_) {}

    // Fallback: If Bingr gateway returned 0 results, query TMDB multi-search directly using working keys
    if (results.length === 0) {
        for (let attempt = 0; attempt < ROTATING_TMDB_KEYS.length; attempt++) {
            const apiKey = getRotatingTmdbKey();
            try {
                const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(clean)}&include_adult=false`, {
                    timeout: 4000,
                    httpsAgent: tmdbAgent
                });
                if (tmdbRes.data?.results && Array.isArray(tmdbRes.data.results) && tmdbRes.data.results.length > 0) {
                    for (const r of tmdbRes.data.results) {
                        if (r.media_type === 'person') continue;
                        results.push({
                            id: r.id,
                            title: r.title || r.name || 'Untitled',
                            name: r.name || r.title,
                            type: r.media_type || (r.title ? 'movie' : 'tv'),
                            year: (r.release_date || r.first_air_date || '').slice(0, 4),
                            poster: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : undefined,
                            backdrop: r.backdrop_path ? `https://image.tmdb.org/t/p/w1280${r.backdrop_path}` : undefined,
                            overview: r.overview,
                            rating: r.vote_average,
                            vote_count: r.vote_count
                        });
                    }
                    break;
                }
            } catch (_) {}
        }
    }

    // Ensure One Piece Anime (TMDB 37854) is present when searching One Piece
    if (/one\s*piece/i.test(clean)) {
        const isLiveActionSpecific = /\b(live action|live-action|netflix|2023)\b/i.test(clean);
        const hasAnime = results.some((r: any) => r.id === 37854);
        if (!hasAnime) {
            try {
                const animeDetails = await getTvDetails(37854);
                if (animeDetails && animeDetails.id) {
                    const animeItem = {
                        id: 37854,
                        title: 'One Piece (Anime)',
                        year: '1999',
                        type: 'tv',
                        poster: animeDetails.poster || 'https://image.tmdb.org/t/p/w500/cMD9Ygz11yj5GvEi4O269vDp8um.jpg',
                        overview: animeDetails.overview || 'Years ago, the fearsome Pirate King Gol D. Roger was executed leaving behind the famed "One Piece" treasure.',
                        rating: animeDetails.rating || 8.7
                    };
                    if (isLiveActionSpecific) {
                        results.push(animeItem);
                    } else {
                        results.unshift(animeItem);
                    }
                }
            } catch {}
        }
    }

    return { results };
}

/**
 * Get Movie Details and full Cast/Character list
 */
export async function getMovieDetails(tmdbId: number | string): Promise<BingrMediaDetails> {
    const cacheKey = `movie:${tmdbId}`;
    const cached = DETAILS_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_DETAILS)) {
        return cached.data;
    }
    const res = await bingrRequest<BingrMediaDetails>(`/details/movie/${tmdbId}`);
    if (res.status !== 200 || !res.data) {
        throw new Error(`Movie not found for TMDB ID: ${tmdbId}`);
    }
    DETAILS_CACHE.set(cacheKey, { timestamp: Date.now(), data: res.data });
    return res.data;
}

/**
 * Get TV Series Details and full Cast/Character list
 */
export async function getTvDetails(tmdbId: number | string): Promise<BingrMediaDetails> {
    const cacheKey = `tv:${tmdbId}`;
    const cached = DETAILS_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_DETAILS)) {
        return cached.data;
    }
    const res = await bingrRequest<BingrMediaDetails>(`/details/tv/${tmdbId}`);
    if (res.status !== 200 || !res.data) {
        throw new Error(`TV Show not found for TMDB ID: ${tmdbId}`);
    }
    DETAILS_CACHE.set(cacheKey, { timestamp: Date.now(), data: res.data });
    return res.data;
}

/**
 * Get Season Episodes
 */
export async function getTvEpisodes(tmdbId: number | string, seasonNumber: number | string): Promise<BingrEpisode[]> {
    const res = await bingrRequest<{ episodes: BingrEpisode[] }>(`/episodes/${tmdbId}/${seasonNumber}`);
    if (res.status !== 200 || !res.data?.episodes) {
        throw new Error(`Episodes not found for TMDB ID ${tmdbId} Season ${seasonNumber}`);
    }
    return res.data.episodes;
}

/**
 * Smart TMDB Matcher: Given an arbitrary title/name from Stalker or M3U, find the best TMDB match
 */
export async function findTmdbMatch(
    rawTitle: string,
    expectedType: 'movie' | 'tv' = 'movie',
    yearHint?: string | number
): Promise<{ id: number; title: string; year?: string; details?: BingrMediaDetails } | null> {
    if (!rawTitle) return null;

    // Check if rawTitle contains a direct numeric ID
    if (/^\d+$/.test(rawTitle.trim())) {
        const numId = parseInt(rawTitle.trim(), 10);
        try {
            const details = expectedType === 'tv' ? await getTvDetails(numId) : await getMovieDetails(numId);
            return { id: details.id, title: details.title, year: details.year, details };
        } catch {}
    }

    // 1. Check for explicit bracketed or parenthesized year, e.g. "Fight Club (1999)" or "[2021]"
    let extractedYear: string | undefined = yearHint ? String(yearHint).trim() : undefined;
    const parenYearMatch = rawTitle.match(/\((?:19\d{2}|20[0-2]\d)\)|\[(?:19\d{2}|20[0-2]\d)\]/);
    if (!extractedYear && parenYearMatch) {
        extractedYear = parenYearMatch[0].replace(/[\[\]\(\)]/g, '');
    }

    // 2. Known titles where a 4-digit number is intrinsically part of the title, NEVER treat as a release year
    const isTitleWithNumber = /\b(2001|2010|2012|2049|2077|1917|1984|300|2000|1941|1942|1408)\b/i.test(rawTitle);

    // 3. If year not yet found and not an intrinsic numbered title, check for trailing or standalone release year
    if (!extractedYear && !isTitleWithNumber) {
        const trailingYearMatch = rawTitle.match(/\b(19\d{2}|20[0-2]\d)\b/);
        if (trailingYearMatch) {
            extractedYear = trailingYearMatch[1];
        }
    }

    // 4. Clean up title: remove bracketed text, release tags, qualities, languages, etc.
    let clean = rawTitle
        .replace(/\[.*?\]|\(.*?\)/g, '')
        .replace(/\b(https?:\/\/\S+|www\.\S+)\b/gi, '')
        // Strip season and episode codes
        .replace(/\bS\d{1,2}(?:\s*E\d{1,2})?\b/gi, '')
        .replace(/\b(?:Season|Series|Episode|Ep)\s*\d+\b/gi, '')
        .replace(/\bE\d{1,3}\b/gi, '')
        // Strip audio/video formats & resolutions
        .replace(/\b(4K|UHD|FHD|HD|1080p?|720p?|480p?|2160p?|WEB-?DL|WEBRip|Blu-?Ray|BRRip|BDRip|HDTV|DVDRip|REMUX|PROPER|REPACK|HDR\d*|HEVC|x264|x265|H\.?264|H\.?265|10bit|AV1)\b/gi, '')
        // Strip audio channels and codecs
        .replace(/\b(AAC\d*|AC3|DDP\d*(\.\d*)?|Dolby|Atmos|TrueHD|5\.1|7\.1|Dual\s*Audio|Multi\s*Audio)\b/gi, '')
        // Strip languages & dubs
        .replace(/\b(Hindi|English|Tamil|Telugu|Kannada|Malayalam|Bengali|Marathi|Punjabi|Gujarati|Dubbed|Org|Subbed|Eng\s*Sub)\b/gi, '')
        .replace(/[._-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // If we extracted a verified release year AND it is not an intrinsic numbered title, strip it from clean search title
    if (extractedYear && !isTitleWithNumber) {
        clean = clean.replace(new RegExp(`\\b${extractedYear}\\b`, 'g'), '').trim();
    }

    if (!clean) clean = rawTitle.replace(/[._-]/g, ' ').replace(/\s+/g, ' ').trim();

    try {
        let searchRes = await searchBingr(clean);
        let results: any[] = searchRes?.results || [];

        // Fallback 1: If 0 results and clean differs from rawTitle, try searching rawTitle without punctuation
        if (results.length === 0 && clean.toLowerCase() !== rawTitle.toLowerCase()) {
            const rawSimple = rawTitle.replace(/[\[\]\(\)._-]/g, ' ').replace(/\s+/g, ' ').trim();
            const fallbackRes = await searchBingr(rawSimple);
            results = fallbackRes?.results || [];
        }

        // Fallback 2: If still 0 results and we have an extractedYear, try searching clean without year constraint
        if (results.length === 0 && extractedYear) {
            const unconstrainedRes = await searchBingr(clean);
            results = unconstrainedRes?.results || [];
        }

        if (results.length === 0) return null;

        // Score results
        let bestMatch: any = null;
        let bestScore = -999;

        const isAnimeQuery = /\b(anime|animated|animation|japanese|straw hat|luffy|wano|egghead|marineford)\b/i.test(rawTitle) || /\b(anime|animated|animation|japanese|straw hat|luffy|wano|egghead|marineford)\b/i.test(clean);
        const isLiveActionQuery = /\b(live action|live-action|netflix|2023)\b/i.test(rawTitle) || /\b(live action|live-action|netflix|2023)\b/i.test(clean);

        // Priority check for One Piece anime unless live action is explicitly requested
        if (/one\s*piece/i.test(clean)) {
            if (!isLiveActionQuery && (!extractedYear || extractedYear !== '2023')) {
                try {
                    const animeDetails = await getTvDetails(37854);
                    if (animeDetails && animeDetails.id) {
                        return {
                            id: 37854,
                            title: 'One Piece (Anime)',
                            year: '1999',
                            details: animeDetails
                        };
                    }
                } catch {}
            }
        }

        const cleanLower = clean.toLowerCase();

        for (const item of results) {
            let score = 0;
            const itemType = item.type || (item.name ? 'tv' : 'movie');

            // Strictly separate Movies and TV Shows
            if (itemType === expectedType) {
                score += 50;
            } else {
                score -= 150; // Severe penalty for mismatched media type
            }

            const itemTitle = (item.title || item.name || '').toLowerCase();

            // Exact title matching
            if (itemTitle === cleanLower) {
                score += 100;
            } else if (itemTitle.startsWith(cleanLower) || cleanLower.startsWith(itemTitle)) {
                score += 60;
            } else if (itemTitle.includes(cleanLower) || cleanLower.includes(itemTitle)) {
                score += 40;
            }

            // Intrinsic number match (e.g. 2049 in "Blade Runner 2049", 2077 in "Cyberpunk 2077")
            if (isTitleWithNumber) {
                const numMatch = rawTitle.match(/\b(2001|2010|2012|2049|2077|1917|1984|300|2000)\b/);
                if (numMatch && itemTitle.includes(numMatch[1])) {
                    score += 120; // Massive boost for matching the intrinsic title number
                }
            }

            // Year scoring
            const itemYearStr = item.year ? String(item.year).slice(0, 4) : '';
            if (extractedYear && itemYearStr) {
                if (itemYearStr === String(extractedYear)) {
                    score += 60;
                } else {
                    const diff = Math.abs(parseInt(itemYearStr, 10) - parseInt(String(extractedYear), 10));
                    if (diff <= 1) {
                        score += 30; // 1-year tolerance
                    } else {
                        score -= 50; // Penalize wrong release year
                    }
                }
            }

            // Popularity / vote count tie-breaker (boost real blockbusters over zero-vote home videos)
            const votes = Number(item.vote_count || item.rating || 0);
            if (votes > 0) {
                score += Math.min(25, Math.log10(votes + 1) * 8);
            }

            // One Piece differentiation
            if (item.id === 37854 || itemTitle.includes('one piece')) {
                if (item.id === 37854) {
                    if (isAnimeQuery || (!isLiveActionQuery && (!extractedYear || extractedYear === '1999'))) {
                        score += 90;
                    }
                } else if (item.id === 111110) {
                    if (isLiveActionQuery || extractedYear === '2023') {
                        score += 90;
                    } else {
                        score -= 60;
                    }
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }

        if (bestMatch && bestMatch.id && bestScore > 0) {
            return {
                id: bestMatch.id,
                title: bestMatch.title || bestMatch.name,
                year: bestMatch.year,
                details: bestMatch
            };
        }
    } catch (e) {
        console.warn(`[BingrMatcher] Failed search for "${clean}":`, e);
    }

    return null;
}

/**
 * Get Subtitles from Direct VTT CDN / Subtitle Engine
 */
export async function getSubtitles(type: 'movie' | 'tv', tmdbId: number | string, season?: number | string, episode?: number | string): Promise<Array<{ lang: string; url: string; label?: string; source?: string }>> {
    const list: Array<{ lang: string; url: string; label?: string; source?: string }> = [];
    if (!tmdbId) return list;

    try {
        // 1. Direct vdrk.site CDN probe (instant and reliable for TMDB IDs)
        const vdrkEn = `https://cache.vdrk.site/v1/vtt/${type}/${tmdbId}/English.vtt`;
        try {
            const check = await axios.head(vdrkEn, { timeout: 1200 });
            if (check.status === 200) {
                list.push({
                    lang: 'en',
                    label: 'English',
                    url: vdrkEn,
                    source: 'vdrk'
                });
            }
        } catch {}

        // 2. SubtitleService search fallback with fast timeout
        if (list.length === 0) {
            const subs = await SubtitleService.searchSubtitles(tmdbId, undefined, 'en');
            for (const s of subs) {
                list.push({
                    lang: s.language || 'en',
                    label: s.label || 'English',
                    url: s.url,
                    source: 'subtitles'
                });
            }
        }
    } catch {}

    return list;
}


/**
 * Universal Stream Scraper with Server Cascade
 */


const TMDB_RUNTIME_CACHE = new Map<string, { runtime: number; timestamp: number }>();
const TMDB_RUNTIME_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Retrieves expected runtime from TMDB with caching and key rotation
 */
export async function getExpectedRuntime(type: 'movie' | 'tv', tmdbId: number, season?: number, episode?: number): Promise<number> {
    const cacheKey = `${type}_${tmdbId}_${season || 0}_${episode || 0}`;
    const cached = TMDB_RUNTIME_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < TMDB_RUNTIME_CACHE_TTL)) {
        return cached.runtime;
    }

    let expectedRuntime = 0;
    for (let attempt = 0; attempt < ROTATING_TMDB_KEYS.length; attempt++) {
        const apiKey = getRotatingTmdbKey();
        try {
            if (type === 'movie') {
                const tmdbRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}`, {
                    timeout: 4000,
                    httpsAgent: tmdbAgent
                });
                expectedRuntime = tmdbRes.data?.runtime || 0;
            } else {
                if (season && episode) {
                    try {
                        const epRes = await axios.get(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}/episode/${episode}?api_key=${apiKey}`, {
                            timeout: 4000,
                            httpsAgent: tmdbAgent
                        });
                        expectedRuntime = epRes.data?.runtime || 0;
                    } catch (_) {}
                }
                if (!expectedRuntime) {
                    const showRes = await axios.get(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}`, {
                        timeout: 4000,
                        httpsAgent: tmdbAgent
                    });
                    if (showRes.data?.episode_run_time && showRes.data.episode_run_time.length > 0) {
                        expectedRuntime = showRes.data.episode_run_time[0];
                    } else if (showRes.data?.runtime) {
                        expectedRuntime = showRes.data.runtime;
                    }
                }
            }
            if (expectedRuntime > 0) {
                break;
            }
        } catch (_) {
            // Try next key if available
        }
    }

    if (expectedRuntime > 0) {
        TMDB_RUNTIME_CACHE.set(cacheKey, { runtime: expectedRuntime, timestamp: Date.now() });
    }
    return expectedRuntime;
}

/**
 * Validates the duration of the M3U8 stream against TMDB expected runtime.
 * Prevents fake/trailer/short loop videos from polluting search and playback.
 */
export async function verifyStreamDuration(
    url: string,
    type: 'movie' | 'tv',
    tmdbId: number,
    season?: number,
    episode?: number,
    isStrict?: boolean
): Promise<{ isValid: boolean; expected?: number; actual?: number; reason?: string }> {
    try {
        if (!url || !url.startsWith('http')) return { isValid: true };

        const expectedRuntime = await getExpectedRuntime(type, tmdbId, season, episode);
        if (expectedRuntime <= 0) {
            // If TMDB runtime is unavailable, allow stream
            return { isValid: true };
        }

        const actualRuntime = await getM3u8Duration(url);
        if (actualRuntime === null) {
            const isSb = await isStoryboardStream(url);
            if (isSb) {
                return {
                    isValid: false,
                    expected: expectedRuntime,
                    reason: 'Storyboard/thumbnail sprite manifest rejected'
                };
            }
            // For progressive MP4 URLs, probe content-length to reject tiny dummy/preview clips
            if ((url.includes('.mp4') || url.includes('/f/') || url.includes('streamrip.fun')) && expectedRuntime >= 30) {
                try {
                    let probeUrl = url;
                    if (probeUrl.startsWith('/')) {
                        probeUrl = `http://127.0.0.1:3000${probeUrl}`;
                    }
                    const headRes = await axios.head(probeUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': 'https://bingr.one/'
                        },
                        timeout: 2500,
                        maxRedirects: 3
                    });
                    const cl = Number(headRes.headers['content-length']);
                    // If content-length is under 35MB for a feature movie (expected >= 45m), it's definitely a dummy/ad clip
                    if (cl > 0 && expectedRuntime >= 45 && cl < 35 * 1024 * 1024) {
                        return {
                            isValid: false,
                            expected: expectedRuntime,
                            reason: `MP4 file size is too small (${Math.round(cl / (1024 * 1024))}MB) for a ${expectedRuntime}m feature film`
                        };
                    }
                } catch (_) {}
            }
            // When upstream CDN protects master playlist with token or live manifest, don't drop legitimate streams
            return { isValid: true, expected: expectedRuntime };
        }

        // Reject fake preview clips, ad loops, trailers, or dummy videos (even if requested strictly)
        const isDummyShort = (expectedRuntime >= 30 && (actualRuntime < 15 || actualRuntime < expectedRuntime * 0.25)) ||
                             (expectedRuntime >= 15 && actualRuntime < 5);
        if (isDummyShort) {
            return {
                isValid: false,
                expected: expectedRuntime,
                actual: actualRuntime,
                reason: `Sample/dummy clip rejected: stream is only ${Math.round(actualRuntime)}m, expected feature of ~${expectedRuntime}m`
            };
        }

        // If user strictly requested this specific server, allow it
        if (isStrict) {
            return { isValid: true, expected: expectedRuntime, actual: actualRuntime };
        }

        const diff = Math.abs(actualRuntime - expectedRuntime);
        // Generous tolerance (handles director cuts, extended editions, sliding window HLS)
        const tolerance = Math.max(45, Math.round(expectedRuntime * 0.45));

        // Feature Film / Movie Scraping
        if (type === 'movie') {
            // Reject fake 1-5 minute trailer clips pretending to be a full feature
            if (actualRuntime < 5 && expectedRuntime >= 30) {
                return {
                    isValid: false,
                    expected: expectedRuntime,
                    actual: actualRuntime,
                    reason: `Trailer or sample clip rejected: stream is only ${Math.round(actualRuntime)}m, expected feature film of ~${expectedRuntime}m`
                };
            }
        } else {
            // TV episode / Anime / Sitcom
            if (actualRuntime < 3 && expectedRuntime >= 15) {
                return {
                    isValid: false,
                    expected: expectedRuntime,
                    actual: actualRuntime,
                    reason: `Teaser clip rejected: stream is only ${Math.round(actualRuntime)}m, expected episode of ~${expectedRuntime}m`
                };
            }
        }

        return { isValid: true, expected: expectedRuntime, actual: (actualRuntime !== null ? actualRuntime : undefined) };
    } catch (e: any) {
        return { isValid: true };
    }
}

/**
 * Deep M3U8 duration parser with full anti-bot headers and Master Playlist traversal
 */
export async function getM3u8Duration(url: string, depth = 0): Promise<number | null> {
    if (!url || depth > 3) return null;
    const lower = url.toLowerCase();
    if (lower.includes('thumbnails.vtt') || lower.includes('spritesheet') || lower.includes('sprite.vtt')) {
        return null; // Reject thumbnail sprite tracks
    }

    try {
        let fetchUrl = url;
        if (fetchUrl.startsWith('/')) {
            fetchUrl = `http://127.0.0.1:3000${fetchUrl}`;
        }

        let parsedOrigin = 'https://bingr.one';
        try {
            const parsed = new URL(fetchUrl);
            parsedOrigin = parsed.origin;
        } catch (_) {}

        const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Accept': '*/*'
        };
        if (fetchUrl.includes('bingr.one') || fetchUrl.includes('api.bingr') || fetchUrl.includes('streamrip.fun')) {
            headers['Referer'] = 'https://bingr.one/';
            headers['Origin'] = 'https://bingr.one';
        }

        const res = await axios.get(fetchUrl, {
            timeout: 6000,
            headers
        });
        const content = res.data;
        if (typeof content !== 'string') return null;

        // 1. Is it a master playlist? (#EXT-X-STREAM-INF)
        if (content.includes('#EXT-X-STREAM-INF')) {
            const lines = content.split(/\r?\n/);
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('#EXT-X-STREAM-INF')) {
                    // Forward scan for the next non-comment URI line
                    for (let j = i + 1; j < lines.length; j++) {
                        const candidate = lines[j].trim();
                        if (!candidate) continue;
                        if (candidate.startsWith('#')) continue;
                        const mediaUrl = candidate.startsWith('http') ? candidate : new URL(candidate, fetchUrl).toString();
                        const dur = await getM3u8Duration(mediaUrl, depth + 1);
                        if (dur !== null && dur > 0) return dur;
                        break;
                    }
                }
            }
            // Fallback: search for any child .m3u8 path
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('#') && (trimmed.includes('.m3u8') || trimmed.includes('/hls/'))) {
                    const mediaUrl = trimmed.startsWith('http') ? trimmed : new URL(trimmed, fetchUrl).toString();
                    const dur = await getM3u8Duration(mediaUrl, depth + 1);
                    if (dur !== null && dur > 0) return dur;
                }
            }
            return null;
        }

        // Sum #EXTINF segments
        const extinfRegex = /#EXTINF:\s*([0-9]+(?:\.[0-9]+)?)/gi;
        let match: RegExpExecArray | null;
        let totalSeconds = 0;
        let segmentCount = 0;
        while ((match = extinfRegex.exec(content)) !== null) {
            const sec = parseFloat(match[1]);
            if (!isNaN(sec) && sec > 0) {
                totalSeconds += sec;
                segmentCount++;
            }
        }

        // 3. Fallback: Target duration approximation if segments exist but explicit durations are omitted
        if (totalSeconds <= 0 && segmentCount > 0) {
            const targetDurMatch = content.match(/#EXT-X-TARGETDURATION:\s*([0-9]+)/i);
            if (targetDurMatch) {
                const targetSec = parseFloat(targetDurMatch[1]);
                if (!isNaN(targetSec) && targetSec > 0) {
                    totalSeconds = targetSec * segmentCount;
                }
            }
        }

        if (totalSeconds > 0) {
            return totalSeconds / 60; // Minutes
        }
        return null;
    } catch (err: any) {
        return null;
    }
}

export async function scrapeBingrStream(params: {
    type?: 'movie' | 'tv' | 'anime';
    id?: number | string;
    title?: string;
    year?: string | number;
    season?: number;
    episode?: number;
    srv?: string;
    strictSrv?: boolean;
    anilistId?: number | string;
    malId?: number | string;
}): Promise<BingrScrapeResult> {
    const isTv = params.type === 'tv' || params.type === 'anime' || (params.type !== 'movie' && (params.season !== undefined || params.episode !== undefined));
    const type: 'movie' | 'tv' | 'anime' = params.type ? params.type : (isTv ? 'tv' : 'movie');
    const strictSrv = !!params.strictSrv;
    let rawIdStr = params.id ? String(params.id).trim() : '';
    let tmdbId = Number(rawIdStr) || 0;
    const rawReqTitle = (params.title || '').trim();
    const isGenericTitle = !rawReqTitle || rawReqTitle.toLowerCase() === 'cinema presentation' || rawReqTitle.toLowerCase() === 'movie' || rawReqTitle.toLowerCase() === 'watch';
    const requestedTitle = isGenericTitle ? '' : rawReqTitle;
    let mediaTitle = requestedTitle;
    let mediaYear = params.year ? String(params.year) : undefined;

    // Direct IMDb ID resolution (e.g. tt3801314 or tt33379543)
    if (rawIdStr.startsWith('tt')) {
        const imdbMatch = await resolveImdbToTmdbId(rawIdStr);
        if (imdbMatch) {
            tmdbId = imdbMatch.tmdbId;
            if (!mediaTitle && imdbMatch.title) mediaTitle = imdbMatch.title;
            if (!mediaYear && imdbMatch.year) mediaYear = imdbMatch.year;
        }
    } else if (!tmdbId && mediaTitle && mediaTitle.trim().startsWith('tt')) {
        const imdbMatch = await resolveImdbToTmdbId(mediaTitle.trim());
        if (imdbMatch) {
            tmdbId = imdbMatch.tmdbId;
            if (imdbMatch.title) mediaTitle = imdbMatch.title;
            if (!mediaYear && imdbMatch.year) mediaYear = imdbMatch.year;
        }
    }

    // If tmdbId is missing, resolve it via search
    if (!tmdbId && mediaTitle) {
        const match = await findTmdbMatch(mediaTitle, type === 'anime' ? 'tv' : type, mediaYear);
        if (match) {
            tmdbId = match.id;
            mediaTitle = match.title;
            if (!mediaYear && match.year) mediaYear = match.year;
        }
    }

    if (!tmdbId && type !== 'anime' && params.srv !== 'bing_anime' && params.srv !== 'hianime' && params.srv !== 'animesalt' && !params.malId) {
        return {
            success: false,
            type: type,
            tmdbId: 0,
            title: mediaTitle,
            error: 'Could not resolve TMDB ID for title: ' + mediaTitle,
            sources: []
        };
    }

    // Auto-resolve title, year, and duration runtime from TMDB
    let tmdbRuntimeMinutes: number | undefined;
    try {
        const details = (type === 'tv' || type === 'anime') ? await getTvDetails(tmdbId) : await getMovieDetails(tmdbId);
        if (details) {
            if (!mediaTitle || isGenericTitle) mediaTitle = details.title;
            if (!mediaYear && details.year) mediaYear = details.year;
            if (details.runtime) tmdbRuntimeMinutes = details.runtime;
        }
    } catch {}

    // Check in-memory stream cache
    const s = isTv ? (params.season !== undefined ? Number(params.season) : 1) : 1;
    const e = isTv ? (params.episode !== undefined ? Number(params.episode) : 1) : 1;
    const reqSrvNormForCache = normalizeServerId(params.srv) || 'default';
    const cacheKey = `${type}:${tmdbId}:${s}:${e}:${reqSrvNormForCache}:${params.strictSrv ? 'strict' : 'auto'}`;
    const cachedStream = STREAM_CACHE.get(cacheKey);
    if (cachedStream && cachedStream.result && cachedStream.result.success && (Date.now() - cachedStream.timestamp < CACHE_TTL_STREAM)) {
        return { ...cachedStream.result };
    }

    const query: Record<string, any> = {
        title: mediaTitle || '',
        year: mediaYear ? String(mediaYear) : undefined
    };

    if (isTv) {
        query.season = String(s);
        query.episode = String(e);
    }

    let malId: number | null = (type !== 'movie' && params.malId) ? Number(params.malId) : null;
    let isAnimeConfirmed = Boolean(type === 'anime' || (type !== 'movie' && params.anilistId));
    let hasSkipTimes = false;
    let isAnimeLikely = Boolean(
        type === 'anime' ||
        (type !== 'movie' && params.anilistId) ||
        (type !== 'movie' && (params as any).isAnime) ||
        (type !== 'movie' && mediaTitle && mediaTitle.match(/\b(naruto|dragon ball|one piece|jujutsu kaisen|bleach|hero academia|demon slayer|hunter x hunter|evangelion|death note|sword art online|frieren|dandadan|solo leveling|kaiju no\.?\s*8|boruto|inuyasha|haikyuu|detective conan|gintama|steins;gate|dr\.?\s*stone|code geass|fairy tail|vinland saga|berserk|cowboy bebop|mob psycho|re:?zero|overlord|danmachi|konosuba|blue lock|spy x family|baki)\b/i))
    );

    // Fast check for MAL ID and anime detection for series before scraping (with strict 1200ms timeout)
    if ((type === 'tv' || type === 'anime') && (requestedTitle || mediaTitle)) {
        try {
            malId = await Promise.race([
                resolveMalIdFromTitle(requestedTitle || mediaTitle),
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
            ]);
            if (!malId && requestedTitle && mediaTitle && requestedTitle !== mediaTitle) {
                malId = await Promise.race([
                    resolveMalIdFromTitle(mediaTitle),
                    new Promise<null>((resolve) => setTimeout(() => resolve(null), 800))
                ]);
            }
            if (malId) {
                const epNum = params.episode || 1;
                const skipData = await Promise.race([
                    fetchAniSkipTimes(malId, epNum),
                    new Promise<null>((resolve) => setTimeout(() => resolve(null), 800))
                ]).catch(() => null);
                if (skipData && skipData.found && skipData.results && skipData.results.length > 0) {
                    hasSkipTimes = true;
                }
                isAnimeConfirmed = true;
                isAnimeLikely = true;
                console.log(`[BingrScraper] Series "${mediaTitle}" confirmed as Anime (MAL #${malId}, Intro Skip: ${hasSkipTimes ? 'Yes' : 'Pending'}). HiAnime/KissKH set as 1st priority.`);
            }
        } catch (e: any) {
            // Non-blocking lookup fallback
        }
    }

    const attempts: Array<{ serverId: string; serverName: string; status: string; latencyMs: number; error?: string }> = [];

    // Helper: Resolve a single server cluster at maximum speed
    async function tryServer(serverId: string): Promise<BingrScrapeResult | null> {
        const serverMeta = BINGR_SERVERS.find(srv => srv.id === serverId) || { id: serverId, name: serverId };
        const startTime = Date.now();

        try {
            let scraperName = serverMeta.name;
            let sources: BingrStreamSource[] = [];
            let subtitles: Array<{ lang: string; url: string; label?: string }> = [];
            let probeDurationSec: number | undefined = undefined;
            let upstreamDurationSec: number | undefined = undefined;
            let probeAudioTracks: any[] = [];

            if (serverId === 'megaplay_buzz' || serverId === 'megaplaybuzz') {
                scraperName = 'MegaPlay Buzz (Direct Multi-Bitrate HLS)';
                const effectiveTitle = requestedTitle || mediaTitle || '';
                const isDub = (params as any).dub === true || (params as any).type === 'dub';
                const megaRes = await resolveMegaPlayBuzzStream(effectiveTitle, e, isDub ? 'dub' : 'sub', s).catch(() => null);
                if (megaRes && megaRes.success && megaRes.masterM3u8) {
                    const proxiedM3u8 = megaRes.masterM3u8.startsWith('/') ? megaRes.masterM3u8 : `/stream_proxy.php?url=${encodeURIComponent(megaRes.masterM3u8)}`;
                    sources = [{
                        url: proxiedM3u8,
                        rawUrl: megaRes.masterM3u8,
                        proxyUrl: proxiedM3u8,
                        quality: '1080p Multi-Bitrate',
                        type: 'application/x-mpegurl',
                        label: `MegaPlay Buzz (${isDub ? 'English DUB' : 'Japanese SUB'})`,
                        name: 'MegaPlay Buzz Direct HLS',
                        language: isDub ? 'English Dub' : 'Japanese Sub',
                        skipProxy: false
                    }];
                    if (megaRes.tracks) {
                        subtitles = megaRes.tracks.map(t => ({
                            lang: t.label || 'en',
                            label: t.label || 'English',
                            url: t.file
                        }));
                    }
                }
            } else if (serverId === 'animepahe' || serverId === 'pahe') {
                scraperName = 'AnimePahe (Direct Google CDN MP4)';
                const effectiveTitle = requestedTitle || mediaTitle || '';
                const paheRes = await resolveAnimePaheStream(effectiveTitle, e).catch(() => null);
                if (paheRes && paheRes.success && paheRes.streams && paheRes.streams.length > 0) {
                    sources = paheRes.streams.map(st => ({
                        url: st.proxyUrl || st.url,
                        rawUrl: st.url,
                        proxyUrl: st.proxyUrl,
                        quality: st.quality,
                        type: 'video/mp4',
                        label: st.label,
                        name: 'AnimePahe Direct CDN',
                        language: 'Japanese (English Sub)'
                    }));
                }
            } else if (serverId === 'moviebox' || serverId === 'movieboxonline') {
                scraperName = 'MovieBox Online (Direct CDN MP4)';
                const effectiveTarget = (params as any).url || (rawIdStr.startsWith('http') ? rawIdStr : '') || requestedTitle || mediaTitle || '';
                const boxRes = await resolveMovieBoxStream(effectiveTarget, s, e).catch(() => null);
                if (boxRes && boxRes.success && boxRes.streams && boxRes.streams.length > 0) {
                    sources = boxRes.streams.map(st => ({
                        url: st.url,
                        rawUrl: st.url,
                        quality: st.quality,
                        type: 'video/mp4',
                        label: st.label,
                        name: 'MovieBox Online CDN',
                        skipProxy: true
                    }));
                }
            } else if (serverId === 'tokyoinsider') {
                scraperName = 'TokyoInsider (Direct 1080p MP4 / High-Speed CDN)';
                const effectiveTitle = requestedTitle || mediaTitle || '';
                const cleanTitle = effectiveTitle.replace(/\s*\((?:anime|tv|series|\d{4})\)/gi, '').replace(/\s*Season\s*\d+/i, '').trim();
                const tokyoRes = await resolveTokyoInsiderStream({ title: cleanTitle, season: s, episode: e }).catch(() => null);
                if (tokyoRes && tokyoRes.success && tokyoRes.source) {
                    sources = [{
                        url: tokyoRes.source.url,
                        rawUrl: tokyoRes.source.rawUrl,
                        quality: tokyoRes.source.quality,
                        type: 'video/mp4',
                        label: tokyoRes.source.label,
                        name: tokyoRes.source.name,
                        language: tokyoRes.source.language,
                        skipProxy: true
                    }];
                } else {
                    const animeRes = await scrapeAnimeEpisode(cleanTitle, s, e).catch(() => null);
                    if (animeRes && animeRes.success && animeRes.sources) {
                        sources = animeRes.sources.map(s => ({
                            url: s.url,
                            rawUrl: s.rawUrl || s.url,
                            quality: s.quality || '1080p',
                            type: s.type || 'application/x-mpegurl',
                            label: s.label || 'Anime Direct HLS',
                            name: s.name,
                            language: s.language,
                            skipProxy: true
                        }));
                    }
                }
            } else if (serverId === 'bing_anime') {
                scraperName = 'Bing Anime (Multi-Audio HLS & Direct)';
                const effectiveTitle = requestedTitle || mediaTitle || '';
                let anilistIdNum = params.anilistId ? Number(params.anilistId) : (type === 'anime' && tmdbId ? tmdbId : undefined);
                let malIdNum = malId;

                // Step A: First attempt direct AnimeSalt Multi-Audio stream (highest fidelity)
                try {
                    const cleanTitle = effectiveTitle.replace(/\s*\((?:anime|tv|series|\d{4})\)/gi, '').replace(/\s*Season\s*\d+/i, '').trim();
                    const saltRes = await scrapeAnimeEpisode(cleanTitle, s, e).catch(() => null);
                    if (saltRes && saltRes.success && saltRes.sources && saltRes.sources.length > 0) {
                        sources = saltRes.sources.map(s => ({
                            url: s.url,
                            rawUrl: s.rawUrl || s.url,
                            quality: s.quality || '1080p',
                            type: s.type || 'application/x-mpegurl',
                            label: s.label || 'Bing Anime (AnimeSalt Multi-Audio)',
                            name: 'Bing Anime | Multi-Audio',
                            language: s.language
                        }));
                        subtitles = (saltRes.subtitles || []).map((sub: any) => ({
                            lang: sub.lang || 'en',
                            label: sub.label || 'English',
                            url: sub.url
                        }));
                        scraperName = 'Bing Anime (AnimeSalt Multi-Audio)';
                    }
                } catch (e: any) {
                    console.warn('[BingrAnime] AnimeSalt attempt notice:', e.message);
                }

                // Step B: If AnimeSalt had no streams, cascade to direct ZokoAnime / HiAnime Sub & Dub
                if (sources.length === 0 && malIdNum) {
                    try {
                        const zokoSub = await resolveZokoStream(malIdNum, e, 'sub').catch(() => null);
                        const zokoDub = await resolveZokoStream(malIdNum, e, 'dub').catch(() => null);
                        if (zokoSub && zokoSub.success && zokoSub.masterM3u8) {
                            sources.push({
                                url: zokoSub.masterM3u8,
                                rawUrl: zokoSub.masterM3u8,
                                quality: '1080p',
                                type: 'application/x-mpegurl',
                                label: 'Bing Anime (Japanese Sub)',
                                name: 'Bing Anime | Japanese Sub',
                                language: 'Japanese Sub',
                                skipProxy: true
                            });
                        }
                        if (zokoDub && zokoDub.success && zokoDub.masterM3u8) {
                            sources.push({
                                url: zokoDub.masterM3u8,
                                rawUrl: zokoDub.masterM3u8,
                                quality: '1080p',
                                type: 'application/x-mpegurl',
                                label: 'Bing Anime (English Dub)',
                                name: 'Bing Anime | English Dub',
                                language: 'English Dub',
                                skipProxy: true
                            });
                        }
                        if (sources.length > 0) {
                            scraperName = 'Bing Anime (HiAnime Direct HLS)';
                            if (zokoSub && zokoSub.subtitles) {
                                subtitles = zokoSub.subtitles.map((sub: any) => ({
                                    lang: sub.lang || 'en',
                                    label: sub.label || 'English',
                                    url: sub.src
                                }));
                            }
                        }
                    } catch (e: any) {
                        console.warn('[BingrAnime] ZokoAnime attempt notice:', e.message);
                    }
                }

                // Step C: Fallback to FrameX TV if still no streams
                if (sources.length === 0) {
                    try {
                        const fxRes = await scrapeFrameXStream({
                            id: tmdbId || undefined,
                            type: 'anime',
                            season: s,
                            episode: e,
                            title: effectiveTitle,
                            malId: malIdNum || undefined
                        });
                        if (fxRes.success && fxRes.sources.length > 0) {
                            scraperName = `Bing Anime (FrameX Fallback)`;
                            sources = fxRes.sources.map((src: any) => ({
                                url: src.url,
                                rawUrl: src.url,
                                proxyUrl: src.url,
                                quality: src.quality || '1080p',
                                type: src.type || 'application/x-mpegurl',
                                label: src.label || 'FrameX Stream',
                                name: src.name || 'Bing Anime | FrameX'
                            }));
                            subtitles = fxRes.subtitles || [];
                        }
                    } catch (e: any) {
                        console.warn('[BingrAnime] FrameX fallback notice:', e.message);
                    }
                }

                // Step D: Fallback to Anivexa / Kitsune Engine (ReAnime, Anikoto, Aniwaves, etc.)
                if (sources.length === 0) {
                    try {
                        let aniId = anilistIdNum;
                        if (!aniId && effectiveTitle) {
                            const cleanSearchTitle = effectiveTitle
                                .replace(/\s*S\d+\s*E\d+/gi, '')
                                .replace(/\s*-\s*Episode\s*\d+/gi, '')
                                .replace(/\s*Episode\s*\d+/gi, '')
                                .replace(/\s*Season\s*\d+/gi, '')
                                .replace(/\s*E\d+/gi, '')
                                .replace(/\(.*\)/g, '')
                                .trim();
                            const found = await fetchAniListEpisodes({ malId: malId || params.malId || undefined, title: cleanSearchTitle || effectiveTitle }).catch(() => null);
                            if (found && found.id) aniId = Number(found.id);
                        }
                        if (aniId) {
                            const anivexaRes = await fetchAnivexaBestStream(aniId, e, 'sub');
                            if (anivexaRes && anivexaRes.success && anivexaRes.streams.length > 0) {
                                scraperName = `Bing Anime (Anivexa ${anivexaRes.provider.toUpperCase()} 1080p)`;
                                sources = anivexaRes.streams.map((s: any) => ({
                                    url: s.proxiedUrl || s.url,
                                    rawUrl: s.url,
                                    proxyUrl: s.proxiedUrl,
                                    quality: '1080p',
                                    type: 'application/x-mpegurl',
                                    label: `Anivexa (${s.server}) ${s.audio.toUpperCase()}`,
                                    name: `Anivexa | ${s.server} ${s.audio.toUpperCase()}`,
                                    skipProxy: true
                                }));
                                subtitles = (anivexaRes.subtitles || []).map((sub: any) => ({
                                    lang: sub.lang || sub.srclang || 'en',
                                    label: sub.label || 'English',
                                    url: sub.url || sub.file
                                }));
                            }
                        }
                    } catch (e: any) {
                        console.warn('[BingrAnime] Anivexa fallback notice:', e.message);
                    }
                }
            } else if (serverId === 'anivexa' || serverId === 'kitsune' || serverId === 'reanime') {
                scraperName = 'Kitsune / Anivexa Engine (Multi-Provider 1080p)';
                const effectiveTitle = requestedTitle || mediaTitle || '';
                let aniId = params.anilistId ? Number(params.anilistId) : undefined;
                if (!aniId && effectiveTitle) {
                    const cleanSearchTitle = effectiveTitle
                        .replace(/\s*S\d+\s*E\d+/gi, '')
                        .replace(/\s*-\s*Episode\s*\d+/gi, '')
                        .replace(/\s*Episode\s*\d+/gi, '')
                        .replace(/\s*Season\s*\d+/gi, '')
                        .replace(/\s*E\d+/gi, '')
                        .replace(/\(.*\)/g, '')
                        .trim();
                    const found = await fetchAniListEpisodes({ malId: malId || params.malId || undefined, title: cleanSearchTitle || effectiveTitle }).catch(() => null);
                    if (found && found.id) aniId = Number(found.id);
                }
                if (aniId) {
                    const isDubReq = (params as any).dub === true || (params as any).audio === 'dub' || (params as any).type === 'dub';

                    // Robust provider resolution: reanime targets reanime with cascade; anivexa/kitsune cascades all 9 top engines
                    const fetchSub = serverId === 'reanime'
                        ? fetchAnivexaWatch('reanime', aniId, 'sub', e).then(r => (!r.success || !r.streams?.length ? fetchAnivexaBestStream(aniId, e, 'sub') : r)).catch(() => fetchAnivexaBestStream(aniId, e, 'sub'))
                        : fetchAnivexaBestStream(aniId, e, 'sub');

                    const fetchDub = serverId === 'reanime'
                        ? fetchAnivexaWatch('reanime', aniId, 'dub', e).then(r => (!r.success || !r.streams?.length ? fetchAnivexaBestStream(aniId, e, 'dub') : r)).catch(() => fetchAnivexaBestStream(aniId, e, 'dub'))
                        : fetchAnivexaBestStream(aniId, e, 'dub');

                    const [subRes, dubRes] = await Promise.all([
                        fetchSub.catch(() => null),
                        fetchDub.catch(() => null)
                    ]);

                    const primaryAudioRes = isDubReq ? (dubRes?.success && dubRes.streams.length > 0 ? dubRes : subRes) : (subRes?.success && subRes.streams.length > 0 ? subRes : dubRes);
                    const secondaryAudioRes = primaryAudioRes === dubRes ? subRes : dubRes;

                    if (primaryAudioRes && primaryAudioRes.success && primaryAudioRes.streams.length > 0) {
                        scraperName = `Kitsune Anivexa (${primaryAudioRes.provider.toUpperCase()} 1080p)`;
                        const isPrimaryDub = primaryAudioRes.audio === 'dub';

                        // 1. Primary audio stream tracks
                        sources = primaryAudioRes.streams.map((s: any) => ({
                            url: s.proxiedUrl || s.url,
                            rawUrl: s.url,
                            proxyUrl: s.proxiedUrl,
                            quality: '1080p',
                            type: 'application/x-mpegurl',
                            label: `Kitsune ${s.server} [${isPrimaryDub ? 'English DUB' : 'Japanese SUB'}]`,
                            name: `Kitsune | ${s.server} [${isPrimaryDub ? 'DUB' : 'SUB'}]`,
                            language: isPrimaryDub ? 'English Dub' : 'Japanese Sub',
                            isDub: isPrimaryDub,
                            skipProxy: true
                        }));

                        // 2. Secondary audio stream tracks (allows user to switch between Japanese Sub and English Dub)
                        if (secondaryAudioRes && secondaryAudioRes.success && secondaryAudioRes.streams.length > 0) {
                            const isSecDub = secondaryAudioRes.audio === 'dub';
                            secondaryAudioRes.streams.forEach((s: any) => {
                                sources.push({
                                    url: s.proxiedUrl || s.url,
                                    rawUrl: s.url,
                                    proxyUrl: s.proxiedUrl,
                                    quality: '1080p',
                                    type: 'application/x-mpegurl',
                                    label: `Kitsune ${s.server} [${isSecDub ? 'English DUB' : 'Japanese SUB'}]`,
                                    name: `Kitsune | ${s.server} [${isSecDub ? 'DUB' : 'SUB'}]`,
                                    language: isSecDub ? 'English Dub' : 'Japanese Sub',
                                    isDub: isSecDub,
                                    skipProxy: true
                                });
                            });
                        }

                        // 3. Merged subtitles
                        const allSubs = [
                            ...(primaryAudioRes.subtitles || []),
                            ...(secondaryAudioRes?.subtitles || [])
                        ];
                        const seenSubUrls = new Set<string>();
                        subtitles = [];
                        for (const sub of allSubs) {
                            const u = sub.url || sub.file;
                            if (u && !seenSubUrls.has(u)) {
                                seenSubUrls.add(u);
                                subtitles.push({
                                    lang: sub.lang || sub.srclang || 'en',
                                    label: sub.label || 'English',
                                    url: u
                                });
                            }
                        }
                    }
                }
            } else if (serverId === 'megaplay' || serverId === 'hianime' || serverId === 'hianime_dub' || serverId === 'megaplay_dub') {
                const isDubReq = serverId.includes('dub') || (params as any).dub === true || (params as any).type === 'dub';
                if (!malId && (requestedTitle || mediaTitle)) {
                    try {
                        malId = await resolveMalIdFromTitle(requestedTitle || mediaTitle);
                        if (!malId && requestedTitle && mediaTitle && requestedTitle !== mediaTitle) {
                            malId = await resolveMalIdFromTitle(mediaTitle);
                        }
                    } catch (_) {}
                }

                // 1. First attempt direct ZokoAnime / HiAnime HLS stream extractor
                if (malId) {
                    try {
                        const targetType: 'sub' | 'dub' = isDubReq ? 'dub' : 'sub';
                        const zokoRes = await resolveZokoStream(malId, e, targetType);
                        if (zokoRes.success && zokoRes.masterM3u8) {
                            scraperName = `HiAnime (${isDubReq ? 'English DUB' : 'Japanese SUB'} · ZokoAnime Direct)`;
                            sources = [{
                                url: zokoRes.masterM3u8,
                                rawUrl: zokoRes.masterM3u8,
                                quality: '1080p',
                                type: 'application/x-mpegurl',
                                label: `HiAnime ${isDubReq ? 'English Dub' : 'Japanese Sub'}`,
                                name: 'HiAnime Direct',
                                language: isDubReq ? 'English Dub' : 'Japanese Sub',
                                skipProxy: true
                            }];
                            // If alt sub/dub is needed, attempt the reverse
                            const altType: 'sub' | 'dub' = isDubReq ? 'sub' : 'dub';
                            const altRes = await resolveZokoStream(malId, e, altType).catch(() => null);
                            if (altRes && altRes.success && altRes.masterM3u8) {
                                sources.push({
                                    url: altRes.masterM3u8,
                                    rawUrl: altRes.masterM3u8,
                                    quality: '1080p',
                                    type: 'application/x-mpegurl',
                                    label: `HiAnime ${isDubReq ? 'Japanese Sub' : 'English Dub'}`,
                                    name: 'HiAnime Direct',
                                    language: isDubReq ? 'Japanese Sub' : 'English Dub',
                                    skipProxy: true
                                });
                            }
                            subtitles = (zokoRes.subtitles || []).map((sub: any) => ({
                                lang: sub.lang || 'en',
                                url: sub.src,
                                label: sub.label || 'English'
                            }));
                        }
                    } catch (_) {}
                }

                // Fallback to legacy MegaPlay if Zoko did not yield
                if (sources.length === 0) {
                    const megaSub = await scrapeMegaPlayAnime({
                        malId: malId || undefined,
                        episode: e,
                        type: 'sub'
                    });
                    const megaDub = await scrapeMegaPlayAnime({
                        malId: malId || undefined,
                        episode: e,
                        type: 'dub'
                    });

                    const primaryRes = isDubReq && megaDub.success && megaDub.sources.length > 0 ? megaDub : (megaSub.success ? megaSub : megaDub);
                    if (primaryRes.success && primaryRes.sources.length > 0) {
                        const activeIsDub = primaryRes === megaDub;
                        scraperName = `HiAnime (${activeIsDub ? 'English DUB' : 'Japanese SUB'})`;
                        sources = primaryRes.sources.map(s => ({
                            ...s,
                            language: activeIsDub ? 'English Dub' : 'Japanese Sub'
                        }));
                        const altRes = activeIsDub ? megaSub : megaDub;
                        if (altRes.success && altRes.sources.length > 0) {
                            altRes.sources.forEach(altSrc => {
                                sources.push({
                                    ...altSrc,
                                    label: activeIsDub ? 'Japanese Sub' : 'English Dub',
                                    language: activeIsDub ? 'Japanese Sub' : 'English Dub'
                                });
                            });
                        }
                        subtitles = primaryRes.subtitles || [];
                    }
                }
            } else if (serverId === 'framex' || serverId === 'framextv') {
                try {
                    const fxRes = await scrapeFrameXStream({
                        id: tmdbId || undefined,
                        type: isAnimeLikely ? 'anime' : (type as any),
                        season: s,
                        episode: e,
                        title: mediaTitle,
                        malId: malId || undefined
                    });
                    if (fxRes.success && fxRes.sources.length > 0) {
                        scraperName = `FrameX TV (${fxRes.provider || fxRes.server || 'Direct Engine'})`;
                        sources = fxRes.sources.map((src: any) => ({
                            url: src.url,
                            quality: src.quality || '1080p',
                            type: src.type || (src.url.includes('.mp4') ? 'video/mp4' : 'application/x-mpegurl'),
                            label: src.label,
                            name: src.name,
                            skipProxy: src.skipProxy ?? true,
                            headers: src.headers,
                            audioTracks: src.audioTracks
                        }));
                        subtitles = (fxRes.subtitles || []).map((sub: any) => ({
                            lang: sub.lang,
                            url: sub.url,
                            label: sub.label
                        }));
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] FrameX error:', err?.message || err);
                }
            } else if (serverId === 'm4u' || serverId === 'movies4u') {
                try {
                    const m4uRes = await scrapeMovies4uCluster({
                        type: type as any,
                        id: tmdbId,
                        title: mediaTitle,
                        year: mediaYear,
                        season: s,
                        episode: e
                    });
                    if (m4uRes && m4uRes.success) {
                        scraperName = m4uRes.scraperName || 'Movie 4U';
                        sources = m4uRes.sources || [];
                        subtitles = m4uRes.subtitles || [];
                        if (m4uRes.duration && m4uRes.duration > 0) {
                            upstreamDurationSec = m4uRes.duration;
                        }
                    } else if (m4uRes?.error) {
                        console.warn('[BingrScraper] Movie 4U fallback:', m4uRes.error);
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] Movies4u error:', err?.message || err);
                }
            } else if (serverId === 'animesalt' || serverId === 'anime') {
                const cleanTitle = (requestedTitle || mediaTitle || '').replace(/\s*\((?:anime|tv|series|\d{4})\)/gi, '').trim();
                const animeRes = await scrapeAnimeEpisode(cleanTitle, s, e);
                scraperName = 'AnimeSalt (Special Anime Scraper)';
                sources = (animeRes.sources || []).map(src => ({
                    url: src.url,
                    quality: src.quality || '1080p',
                    type: src.type || 'application/x-mpegurl',
                    label: src.label,
                    name: src.name
                }));
                subtitles = (animeRes.subtitles || []).map(sub => ({
                    lang: sub.lang,
                    url: sub.url,
                    label: sub.label
                }));
            } else if (serverId === 'ranime' || serverId === 'rareanimes') {
                const rareRes = await resolveRareAnimeStream({
                    title: mediaTitle,
                    season: s,
                    episode: e
                });
                scraperName = 'RareAnimes (Hindi Dub / Rare Anime Scraper)';
                sources = (rareRes.sources || []).map(src => ({
                    url: src.iframeUrl || src.embedUrl,
                    quality: '1080p',
                    type: 'embed',
                    label: `RareAnimes (Vimeo ${src.vimeoId})`,
                    name: `RareAnimes ${src.language ? `[${src.language.toUpperCase()}]` : ''}`
                }));
            } else if (serverId === 'kisskh') {
                const kissResults = await searchKissKh(mediaTitle);
                if (kissResults && kissResults.length > 0) {
                    const cleanQ = mediaTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const exact = kissResults.find(r => r.title.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanQ) || kissResults[0];
                    const drama = await getKissKhDrama(String(exact.id));
                    const targetEp = type === 'tv' ? (s ? e : 1) : 1;
                    const foundEp = drama?.episodes?.find(epItem => epItem.number === targetEp) || drama?.episodes?.[targetEp - 1] || drama?.episodes?.[0];
                    if (foundEp) {
                        const streamData = await resolveKissKhEpisode(String(foundEp.id));
                        if (streamData && streamData.video) {
                            scraperName = 'KissKH (Asian Drama & Anime)';
                            sources = [{
                                url: streamData.video,
                                quality: '1080p FHD',
                                type: 'application/x-mpegurl',
                                label: 'KissKH Direct HLS',
                                name: 'KissKH'
                            }];
                            subtitles = (streamData.subtitles || []).map((sub: any) => ({
                                lang: sub.label || sub.land || 'English',
                                url: sub.src || sub.url,
                                label: sub.label || 'English'
                            }));
                        }
                    }
                }
            } else if (serverId === 'asiaflix') {
                const afResults = await searchAsiaflix(mediaTitle);
                if (afResults && afResults.length > 0) {
                    const target = afResults[0];
                    const targetEp = type === 'tv' ? (s ? e : 1) : 1;
                    const streamData = await resolveAsiaflixEpisodeStream(target.slug, targetEp);
                    if (streamData && streamData.video) {
                        scraperName = 'Asiaflix (Vidmoly Multi-Bitrate HLS)';
                        sources = [{
                            url: streamData.video,
                            quality: '720p/1080p',
                            type: 'application/x-mpegurl',
                            label: 'Vidmoly HLS',
                            name: 'Asiaflix'
                        }];
                    }
                }
            } else if (
                serverId === 'prism' || serverId === 'citadel' || serverId === 'evion' || serverId === 'pulse' || serverId === 'volt' || serverId === 'nimbus' || serverId === 'flux' ||
                serverId === 's30' || serverId === 'nova' ||
                serverId === 's62' || serverId === 'bastion' || serverId === 'baiston' ||
                serverId === 's40' || serverId === 'aphelion' ||
                serverId === 's80' || serverId === 'moscow' ||
                serverId === 's31' || serverId === 'orion' || serverId === 'ornion' ||
                serverId === 's3' || serverId === 'edmunds' || serverId === 'edmedus' || serverId === 'edmendus' ||
                serverId === 's70' || serverId === 'polaris' ||
                serverId === 's81' || serverId === 'novo' ||
                serverId === 's60' || serverId === 'vertex' ||
                serverId === 's63' || serverId === 'hallyu' ||
                serverId === 's61' || serverId === 'corvus' ||
                serverId === 's71' || serverId === 's72' || serverId === 's12' || serverId === 's11' ||
                serverId === 's50' || serverId === 's51' || serverId === 's1' || serverId === 's2' || serverId === 's4' || serverId === 's5'
            ) {
                try {
                    const ngRes = await scrapeBingrNextGen({
                        tmdbId: Number(tmdbId),
                        type: isAnimeLikely ? 'tv' : type,
                        season: isTv ? s : undefined,
                        episode: isTv ? e : undefined,
                        provider: serverId
                    });
                    if (ngRes.success && ngRes.streams && ngRes.streams.length > 0) {
                        scraperName = ngRes.provider?.label || serverMeta.name;
                        sources = ngRes.streams.map((st: any) => ({
                            url: st.url,
                            quality: st.quality || '1080p',
                            type: st.type === 'hls' ? 'application/x-mpegurl' : 'application/dash+xml',
                            label: `${scraperName} ${st.language ? `[${st.language}]` : ''} · ${st.quality || '1080p'}`,
                            name: scraperName,
                            language: st.language
                        }));
                        const firstWithSubs = ngRes.streams.find((st: any) => st.subtitles && st.subtitles.length > 0);
                        if (firstWithSubs && firstWithSubs.subtitles) {
                            subtitles = firstWithSubs.subtitles.map((sub: any) => ({
                                lang: sub.lang || 'en',
                                url: sub.url,
                                label: sub.label || 'Subtitles'
                            }));
                        }
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] NextGen error:', err?.message || err);
                }
            } else if (serverId === 'sm_hub' || serverId === 'smmovies' || serverId === 'moviehub' || serverId === 'fibwatch' || serverId === 'sm movie pro' || serverId === 'sm_movie_pro' || serverId === 'sm-movie-pro' || serverId === 'sm movie' || serverId === 'smmoviepro') {
                const smRes = await findSmMovieStream({
                    type: type as any,
                    title: mediaTitle,
                    year: mediaYear,
                    season: s,
                    episode: e
                });
                if (smRes && smRes.success && smRes.sources.length > 0) {
                    scraperName = smRes.scraperName || 'SM Movie Hub (Direct VOD/MKV)';
                    if (smRes.duration) probeDurationSec = smRes.duration;
                    if (smRes.audioTracks && smRes.audioTracks.length > 0) probeAudioTracks = smRes.audioTracks;
                    sources = smRes.sources.map(src => ({
                        url: src.url,
                        quality: src.quality || '1080p',
                        type: src.type || 'video/x-matroska',
                        label: src.label,
                        name: src.name
                    }));
                }
            } else if (serverId === 'cinepro' || serverId === 'cinepro_core') {
                scraperName = 'CinePro Core (OMSS Multi-Provider)';
                try {
                    const cineRes = await getCineProStreams(tmdbId, type === 'anime' ? 'tv' : type, s ? Number(s) : 1, e ? Number(e) : 1);
                    if (cineRes && cineRes.sources && cineRes.sources.length > 0) {
                        const directOnly = cineRes.sources.filter(src => src.type !== 'embed');
                        if (directOnly.length > 0) {
                            sources = directOnly.map(src => ({
                                url: src.url,
                                quality: src.quality || '1080p',
                                type: 'application/x-mpegurl',
                                label: src.name,
                                name: src.name
                            }));
                        }
                    }
                } catch (_) {}
            } else if (serverId === 'netmirror') {
                try {
                    let nmQuery = (mediaTitle || requestedTitle || '').toString().trim();
                    if (!nmQuery || nmQuery.toLowerCase() === 'cinema presentation' || nmQuery.toLowerCase() === 'movie') {
                        if (tmdbId) {
                            try {
                                const details = type === 'tv' ? await getTvDetails(tmdbId) : await getMovieDetails(tmdbId);
                                if (details?.title) nmQuery = details.title;
                            } catch (_) {}
                        }
                    }
                    if (!nmQuery) nmQuery = 'Movie';
                    const nmRes = await NetMirrorService.resolveMedia(
                        nmQuery,
                        type === 'movie' ? 'movie' : 'tv',
                        s,
                        e
                    );
                    if (nmRes && nmRes.proxiedSources.length > 0) {
                        scraperName = nmRes.provider;
                        sources = nmRes.proxiedSources.map(ps => ({
                            url: ps.url,
                            quality: ps.quality || 'Auto',
                            type: ps.format === 'hls' ? 'application/x-mpegurl' : 'video/mp4',
                            label: `NetMirror ${ps.quality || '1080p'} (${nmRes.platform.toUpperCase()})`,
                            name: `NetMirror | ${ps.quality || '1080p'}`
                        }));
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] NetMirror error:', err?.message || err);
                }
            } else if (serverId === 'nestzone' || serverId === 'miku') {
                try {
                    const nzTargetId = params.anilistId || tmdbId || 195516;
                    const nzRes = await NestZoneAnimeService.resolveEpisodeStream(
                        nzTargetId,
                        e,
                        'sub'
                    );
                    if (nzRes && nzRes.length > 0) {
                        scraperName = 'NestZone Miku (High-Speed Anime)';
                        sources = nzRes.map(nz => ({
                            url: nz.proxiedUrl,
                            quality: nz.quality || 'HD',
                            type: nz.format === 'hls' ? 'application/x-mpegurl' : nz.format === 'mp4' ? 'video/mp4' : 'embed',
                            label: `NestZone ${nz.serverName}`,
                            name: `NestZone | ${nz.serverName}`
                        }));
                        if (nzRes[0]?.subtitles && nzRes[0].subtitles.length > 0) {
                            subtitles = nzRes[0].subtitles.map(sub => ({
                                url: sub.url,
                                lang: sub.lang || 'en',
                                label: sub.label || 'English'
                            }));
                        }
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] NestZone error:', err?.message || err);
                }
            } else if (serverId === 'vidlink' || serverId === 'vidlinkpro') {
                try {
                    // Fetch native VidLink Pro directly (fast 4.5s max; tier cascade handles vidrift/m4u/filmu in parallel if unavailable)
                    const vlRes = await scrapeVidlinkStream({
                        tmdbId: tmdbId!,
                        type: isAnimeLikely ? 'anime' : (type as any),
                        season: s,
                        episode: e,
                        malId: malId || undefined
                    });

                    if (vlRes && vlRes.success && vlRes.sources && vlRes.sources.length > 0) {
                        scraperName = 'VidLink Pro (Direct CDN)';
                        sources = [...vlRes.sources];
                        subtitles = vlRes.subtitles || [];

                        // Re-attach multi-audio dubs from Vidrift for dual-audio & Hindi/Regional playback
                        try {
                            const vdRes = await scrapeVidriftStream({
                                tmdbId: tmdbId!,
                                type: isAnimeLikely ? 'anime' : (type as any),
                                season: s,
                                episode: e
                            });
                            if (vdRes.success && vdRes.sources.length > 0) {
                                for (const orionSrc of vdRes.sources) {
                                    sources.push({
                                        ...orionSrc,
                                        label: `VidLink Multi-Audio (${orionSrc.label})`,
                                        name: `VidLink | ${orionSrc.name || 'Dub'}`,
                                        isDub: true
                                    });
                                }
                            }
                        } catch (_) {}
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] VidLink error:', err?.message || err);
                }
            } else if (serverId === 'vidrift') {
                try {
                    const vdRes = await scrapeVidriftStream({
                        tmdbId: tmdbId!,
                        type: isAnimeLikely ? 'anime' : (type as any),
                        season: s,
                        episode: e
                    });
                    if (vdRes.success && vdRes.sources.length > 0) {
                        scraperName = 'Vidrift (Decrypted Multi-Provider HLS)';
                        sources = vdRes.sources;
                        subtitles = vdRes.subtitles;
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] Vidrift error:', err?.message || err);
                }
            } else if (serverId === 'filmu' || serverId === 'vidly') {
                try {
                    const flRes = await scrapeFilmuStream({
                        tmdbId: tmdbId!,
                        type: isAnimeLikely ? 'anime' : (type as any),
                        season: s,
                        episode: e
                    });
                    if (flRes.success && flRes.sources.length > 0) {
                        scraperName = 'Filmu / Vidly (Decrypted Stream)';
                        sources = flRes.sources;
                        subtitles = flRes.subtitles;
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] Filmu error:', err?.message || err);
                }
            } else if (serverId === 'vidsrc' || serverId === 'vidsrcpro') {
                try {
                    const vsRes = await scrapeVidsrcStream({
                        id: tmdbId || (params as any).imdbId || params.id || '',
                        type: isAnimeLikely ? 'anime' : (type as any),
                        season: s,
                        episode: e
                    });
                    if (vsRes.success && vsRes.sources.length > 0) {
                        scraperName = 'VidSrc (Universal Multi-Source)';
                        sources = vsRes.sources;
                        subtitles = vsRes.subtitles;
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] VidSrc error:', err?.message || err);
                }
            } else if (serverId === 'two_embed' || serverId === '2embed') {
                try {
                    const teRes = await scrape2EmbedStream({
                        tmdbId: tmdbId!,
                        type: isAnimeLikely ? 'anime' : (type as any),
                        season: s,
                        episode: e
                    });
                    if (teRes.success && teRes.sources.length > 0) {
                        scraperName = '2Embed (Swish / 2vCDN Direct HLS)';
                        sources = teRes.sources;
                        subtitles = teRes.subtitles || [];
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] 2Embed error:', err?.message || err);
                }
            } else if (serverId === 'smashy' || serverId === 'smashystream') {
                try {
                    const smRes = await scrapeSmashyStream({
                        tmdbId: tmdbId!,
                        type: isAnimeLikely ? 'anime' : (type as any),
                        season: s,
                        episode: e
                    });
                    if (smRes.success && smRes.sources.length > 0) {
                        scraperName = 'SmashyStream (Multi-Host HLS)';
                        sources = smRes.sources;
                        subtitles = smRes.subtitles || [];
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] SmashyStream error:', err?.message || err);
                }
            } else if (serverId === 'aniembed' || serverId === 'ani_embed') {
                try {
                    const aeRes = await scrapeAniEmbedStream({
                        id: malId || tmdbId!,
                        type: 'anime',
                        episode: e,
                        anilistId: params.anilistId
                    });
                    if (aeRes.success && aeRes.sources.length > 0) {
                        scraperName = 'AniEmbed (Dual Audio JP/EN HLS)';
                        sources = aeRes.sources;
                        subtitles = aeRes.subtitles || [];
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] AniEmbed error:', err?.message || err);
                }
            } else if (serverId === 'zanix') {
                try {
                    const zxRes = await scrapeZanixStream({
                        id: tmdbId || malId!,
                        anilistId: malId || undefined,
                        type: isAnimeLikely ? 'anime' : (type as any),
                        season: s,
                        episode: e,
                        title: mediaTitle
                    });
                    if (zxRes.success && zxRes.sources.length > 0) {
                        scraperName = 'Zanix Anime (FlixEra & NovusCloud)';
                        sources = zxRes.sources;
                        subtitles = zxRes.subtitles || [];
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] Zanix error:', err?.message || err);
                }
            } else if (serverId === 'flux') {
                try {
                    const fxRes = await scrapeFluxStream({
                        tmdbId: tmdbId!,
                        type: isAnimeLikely ? 'anime' : (type as any),
                        season: s,
                        episode: e
                    });
                    if (fxRes.success && fxRes.sources.length > 0) {
                        scraperName = 'Flux (VidBinge & SudoFlix Direct HLS)';
                        sources = fxRes.sources;
                        subtitles = fxRes.subtitles || [];
                    }
                } catch (err: any) {
                    console.warn('[BingrScraper] Flux error:', err?.message || err);
                }
            } else if (serverId === 'vidbolt' || serverId === 'vidy' || serverId === 'cinezo') {
                const targetId = tmdbId || 0;
                const epNum = e || 1;
                const sNum = s || 1;
                let embedUrl = '';
                if (serverId === 'vidbolt') {
                    scraperName = 'Vidbolt (Vidbolt Embed Streamer)';
                    embedUrl = type === 'tv'
                        ? `https://vidbolt.xyz/tv/${targetId}/${sNum}/${epNum}`
                        : ((type as string) === 'anime' ? `https://vidbolt.xyz/anime/${malId || targetId}/${epNum}` : `https://vidbolt.xyz/movie/${targetId}`);
                } else if (serverId === 'vidy') {
                    scraperName = 'Vidy (Vidy.st Direct Embed)';
                    embedUrl = type === 'tv'
                        ? `https://www.vidy.st/tv/${targetId}/${sNum}/${epNum}`
                        : ((type as string) === 'anime' ? `https://www.vidy.st/anime/${malId || targetId}/${epNum}` : `https://www.vidy.st/movie/${targetId}`);
                } else if (serverId === 'cinezo') {
                    scraperName = 'Cinezo (Player Cinezo Multi-Audio)';
                    embedUrl = type === 'tv'
                        ? `https://player.cinezo.live/embed/tv/${targetId}/${sNum}/${epNum}`
                        : ((type as string) === 'anime' ? `https://player.cinezo.live/embed/anime/${malId || targetId}/${epNum}?dub=true` : `https://player.cinezo.live/embed/movie/${targetId}`);
                }

                if (embedUrl) {
                    sources = [{
                        url: embedUrl,
                        quality: '1080p Auto',
                        type: 'embed',
                        label: `${scraperName} Player`,
                        name: scraperName
                    }];
                }
            } else {
                const payload = {
                    srv: serverId,
                    t: type,
                    id: Number(tmdbId),
                    query
                };
                const referer = type === 'tv'
                    ? `https://bingr.one/watch/tv/${tmdbId}/${s}/${e}`
                    : `https://bingr.one/watch/movie/${tmdbId}`;

                // Upstream cluster timeout (8000ms for strict user queries, 3500ms for cascade)
                const timeoutMs = params.strictSrv ? 8000 : 3500;

                let res: { status: number; data: any } | null = null;
                try {
                    res = await bingrRequest<{
                        scraperName?: string;
                        sources?: BingrStreamSource[];
                        subtitles?: Array<{ lang: string; url: string; label?: string }>;
                    }>('/stream', {
                        method: 'POST',
                        body: payload,
                        referer,
                        timeout: timeoutMs
                    });
                } catch (bErr) {}

                if (res && res.status === 200 && res.data?.sources && res.data.sources.length > 0) {
                    scraperName = res.data?.scraperName || serverMeta.name;
                    sources = res.data.sources;
                    subtitles = res.data?.subtitles || [];
                    if (res.data?.duration && Number(res.data.duration) > 10) {
                        upstreamDurationSec = Number(res.data.duration) * 60;
                    }
                } else {
                    // Fallback: If legacy DarkMatter /stream returns 500/404, probe Bingr NextGen engine
                    try {
                        const ngFallback = await scrapeBingrNextGen({
                            tmdbId: Number(tmdbId),
                            type: isAnimeLikely ? 'tv' : type,
                            season: isTv ? s : undefined,
                            episode: isTv ? e : undefined,
                            provider: serverId
                        });
                        if (ngFallback.success && ngFallback.streams && ngFallback.streams.length > 0) {
                            scraperName = ngFallback.provider?.label || serverMeta.name;
                            sources = ngFallback.streams.map((st: any) => ({
                                url: st.url,
                                quality: st.quality || '1080p',
                                type: st.type === 'hls' ? 'application/x-mpegurl' : 'application/dash+xml',
                                label: `${scraperName} ${st.language ? `[${st.language}]` : ''} · ${st.quality || '1080p'}`,
                                name: scraperName,
                                language: st.language
                            }));
                            const firstWithSubs = ngFallback.streams.find((st: any) => st.subtitles && st.subtitles.length > 0);
                            if (firstWithSubs && firstWithSubs.subtitles) {
                                subtitles = firstWithSubs.subtitles.map((sub: any) => ({
                                    lang: sub.lang || 'en',
                                    url: sub.url,
                                    label: sub.label || 'Subtitles'
                                }));
                            }
                        }
                    } catch (_) {}
                    if (!sources || sources.length === 0) {
                        throw new Error(`Upstream returned status ${res?.status || 500}`);
                    }
                }
            }

            const latencyMs = Date.now() - startTime;

            if (sources && sources.length > 0) {
                // Ensure rawUrl, directUrl, and referrer are populated for every source
                for (const s of sources) {
                    const candidate = (s as any).rawUrl || (s as any).directUrl || s.url;
                    const unwrapped = unwrapDirectStreamUrl(candidate);
                    if (unwrapped.streamUrl) {
                        (s as any).rawUrl = unwrapped.streamUrl;
                        (s as any).directUrl = unwrapped.streamUrl;
                        if (unwrapped.referer && !(s as any).referrer) {
                            (s as any).referrer = unwrapped.referer;
                        }
                    }
                    const targetRaw = unwrapped.streamUrl || (s as any).rawUrl || s.url;
                    (s as any).rawUrl = targetRaw;
                    (s as any).directUrl = targetRaw;

                    const isSpecialLocal = s.url.startsWith('/') || s.url.startsWith('http://localhost') || s.url.startsWith('http://127.0.0.1');
                    const shouldProxy = !isSpecialLocal && !(s as any).skipProxy && s.type !== 'embed' && (targetRaw.startsWith('http://') || targetRaw.startsWith('https://'));

                    if (shouldProxy) {
                        if (!s.url.startsWith('/stream_proxy.php')) {
                            (s as any).proxyUrl = s.url;
                            s.url = `/stream_proxy.php?url=${encodeURIComponent(targetRaw)}`;
                        }
                    }
                }

                const qScore = (q: string = '') => {
                    const l = q.toLowerCase();
                    if (l.includes('4k') || l.includes('2160')) return 4000;
                    if (l.includes('1080') || l.includes('fhd')) return 1080;
                    if (l.includes('720') || l.includes('hd')) return 720;
                    if (l.includes('480')) return 480;
                    return 500;
                };

                if (serverId === 'vidlink' || serverId === 'vidlinkpro') {
                    // Keep native Vidlink video sources first (sorted by quality), followed by secondary dubs
                    const primaries = sources.filter(s => !(s as any).isDub);
                    const dubs = sources.filter(s => (s as any).isDub);
                    primaries.sort((a, b) => qScore(b.quality) - qScore(a.quality));
                    dubs.sort((a, b) => qScore(b.quality) - qScore(a.quality));
                    sources = primaries.length > 0 ? [...primaries, ...dubs] : dubs;
                } else {
                    sources.sort((a, b) => qScore(b.quality) - qScore(a.quality));
                }

                const candidateUrl = sources[0].url;
                let durCheck: { isValid: boolean; expected?: number; actual?: number; reason?: string } = { isValid: true };

                if (sources[0].type !== 'embed' && serverId !== 'animepahe' && serverId !== 'pahe' && serverId !== 'moviebox' && serverId !== 'movieboxonline') {
                    // Parallel reachability check across up to 5 candidate sources (prevents sequential timeout hangs)
                    const checkSlice = sources.slice(0, 5);
                    const reachResults = await Promise.all(
                        checkSlice.map(src => verifyStreamReachable(src.url, 2800))
                    );
                    const activeIndex = reachResults.findIndex(r => r === true);

                    if (activeIndex === -1) {
                        const embedFallback = sources.find(s => s.type === 'embed');
                        if (embedFallback) {
                            sources = [embedFallback];
                        } else {
                            attempts.push({
                                serverId,
                                serverName: serverMeta.name,
                                status: '404_unreachable',
                                latencyMs,
                                error: `Upstream returned HTTP 404/dead link for ${candidateUrl}`
                            });
                            return null;
                        }
                    }

                    // Promote healthy working source to primary if fallback was needed
                    if (activeIndex > 0) {
                        const [healthySrc] = sources.splice(activeIndex, 1);
                        sources.unshift(healthySrc);
                    }
                    const activeCandidateUrl = sources[0].url;

                    // Storyboard Scrubbing Thumbnail Detection (rejects thumbnail sprites / tiles.m3u8)
                    const isStoryboard = await isStoryboardStream(activeCandidateUrl);
                    if (isStoryboard) {
                        attempts.push({
                            serverId,
                            serverName: serverMeta.name,
                            status: 'storyboard_rejected',
                            latencyMs,
                            error: `Storyboard thumbnail scrub playlist rejected (no genuine video stream): ${activeCandidateUrl}`
                        });
                        return null;
                    }
                    
                    // Duration verification (permissive — never drops streams)
                    if (upstreamDurationSec && upstreamDurationSec > 0) {
                        durCheck = { isValid: true, actual: upstreamDurationSec / 60 };
                    } else {
                        durCheck = await Promise.race([
                            verifyStreamDuration(activeCandidateUrl, (type === 'anime' ? 'movie' : type), Number(tmdbId), s ? Number(s) : undefined, e ? Number(e) : undefined, strictSrv),
                            new Promise<{ isValid: boolean }>((resolve) => setTimeout(() => resolve({ isValid: true }), 1500))
                        ]);
                    }
                    if (!durCheck.isValid) {
                        console.warn(`[BingrScraper] Duration warning on ${serverId}: ${durCheck.reason}`);
                        if (!strictSrv && durCheck.actual && durCheck.expected && durCheck.actual < 15 && durCheck.expected >= 30) {
                            attempts.push({
                                serverId,
                                serverName: serverMeta.name,
                                status: 'duration_rejected',
                                latencyMs,
                                error: `Sample/clip rejected (${Math.round(durCheck.actual)}m vs expected ${durCheck.expected}m): ${durCheck.reason}`
                            });
                            return null;
                        }
                    }
                }

                if (subtitles.length <= 1) {
                    try {
                        const vdrkSubs = await getSubtitles((type === 'anime' ? 'movie' : type), tmdbId, s, e);
                        if (vdrkSubs && vdrkSubs.length > subtitles.length) {
                            subtitles = vdrkSubs;
                        }
                    } catch {}
                }

                const result: BingrScrapeResult = {
                    success: true,
                    type,
                    tmdbId: Number(tmdbId),
                    title: mediaTitle,
                    year: mediaYear,
                    ...(type === 'tv' ? { season: s, episode: e } : {}),
                    serverId,
                    serverName: serverMeta.name,
                    scraperName: scraperName,
                    primaryM3u8: (sources[0] && sources[0].type === 'embed') ? undefined : (sources[0]?.url || candidateUrl),
                    quality: sources[0].quality || '1080p',
                    sources: sources,
                    subtitles: subtitles,
                    audioTracks: probeAudioTracks,
                    expectedDurationMinutes: durCheck.expected || tmdbRuntimeMinutes,
                    streamDurationMinutes: durCheck.actual || (probeDurationSec ? Math.round(probeDurationSec / 60) : tmdbRuntimeMinutes),
                    streamDurationSec: probeDurationSec || (durCheck.actual ? Math.round(durCheck.actual * 60) : (tmdbRuntimeMinutes ? tmdbRuntimeMinutes * 60 : (durCheck.expected ? Math.round(durCheck.expected * 60) : undefined))),
                    duration: probeDurationSec ? Math.round(probeDurationSec / 60) : (durCheck.actual || tmdbRuntimeMinutes || durCheck.expected)
                };

                attempts.push({
                    serverId,
                    serverName: serverMeta.name,
                    status: 'success',
                    latencyMs
                });
                return result;
            } else {
                attempts.push({
                    serverId,
                    serverName: serverMeta.name,
                    status: 'empty_sources',
                    latencyMs
                });
                return null;
            }
        } catch (err: any) {
            attempts.push({
                serverId,
                serverName: serverMeta.name,
                status: 'error',
                latencyMs: Date.now() - startTime,
                error: err?.message || 'Network error'
            });
            return null;
        }
    }

    // Staged parallel cluster cascade
    let successResult: BingrScrapeResult | null = null;
    let fallbackEmbedResult: BingrScrapeResult | null = null;

    const checkDirect = (res: BingrScrapeResult | null): boolean => {
        if (!res || !res.success) return false;
        return Boolean(res.sources && res.sources.some(s =>
            s.type !== 'embed' &&
            Boolean(s.url && (
                s.url.includes('.m3u8') ||
                s.url.includes('/api/proxy') ||
                s.url.includes('/stream') ||
                s.url.includes('/transcode') ||
                s.url.includes('.mpd') ||
                s.url.includes('.mp4') ||
                s.url.includes('.mkv') ||
                s.url.includes('http') ||
                s.type === 'application/x-mpegurl' ||
                s.type === 'hls' ||
                s.type === 'application/dash+xml' ||
                s.type === 'video/mp4' ||
                s.type === 'video/x-matroska'
            ))
        ));
    };

    const normalizedReqSrv = normalizeServerId(params.srv);
    if (normalizedReqSrv) {
        const preferredRes = await tryServer(normalizedReqSrv);
        if (preferredRes && checkDirect(preferredRes)) {
            successResult = preferredRes;
            STREAM_CACHE.set(cacheKey, { timestamp: Date.now(), result: { ...successResult, attempts } });
            return { ...successResult, attempts };
        } else if (preferredRes) {
            fallbackEmbedResult = preferredRes;
        }

        if (params.strictSrv) {
            if (fallbackEmbedResult) {
                return { ...fallbackEmbedResult, attempts };
            }
            return {
                success: false,
                type,
                tmdbId: Number(tmdbId) || 0,
                title: mediaTitle,
                serverId: normalizedReqSrv,
                serverName: BINGR_SERVERS.find(s => s.id === normalizedReqSrv)?.name || normalizedReqSrv,
                error: `No stream available on ${BINGR_SERVERS.find(s => s.id === normalizedReqSrv)?.name || normalizedReqSrv}`,
                sources: [],
                attempts
            };
        }
    }

    if (!successResult) {
        // If content has a MAL ID or is anime (and not a movie), strictly search ONLY anime-special scrapers
        const isAnimeTarget = (type !== 'movie') && Boolean(malId || isAnimeConfirmed || isAnimeLikely || params.anilistId || type === 'anime');

        // Filter out normalizedReqSrv if already tried
        const filterTier = (tier: string[]) => normalizedReqSrv ? tier.filter(s => s !== normalizedReqSrv) : tier;

        // Fast race helper: returns immediately as soon as ANY server in the tier finds a direct stream
        async function raceTierForDirectStream(tierList: string[], maxWaitMs = 4500): Promise<BingrScrapeResult | null> {
            const list = filterTier(tierList);
            if (list.length === 0) return null;

            return new Promise((resolve) => {
                let resolved = false;
                let pending = list.length;

                const timer = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        resolve(null);
                    }
                }, maxWaitMs);

                for (const srv of list) {
                    tryServer(srv).then((val) => {
                        if (resolved) return;
                        if (val && checkDirect(val)) {
                            resolved = true;
                            clearTimeout(timer);
                            resolve(val);
                        } else {
                            if (val && !fallbackEmbedResult) {
                                fallbackEmbedResult = val;
                            }
                            pending--;
                            if (pending === 0 && !resolved) {
                                resolved = true;
                                clearTimeout(timer);
                                resolve(null);
                            }
                        }
                    }).catch(() => {
                        if (resolved) return;
                        pending--;
                        if (pending === 0 && !resolved) {
                            resolved = true;
                            clearTimeout(timer);
                            resolve(null);
                        }
                    });
                }
            });
        }

        if (isAnimeTarget) {
            // Priority 1: Check Anivexa / ReAnime directly first
            const primaryAnime = await tryServer('anivexa');
            if (primaryAnime && checkDirect(primaryAnime)) {
                successResult = primaryAnime;
            } else {
                const reanimeRes = await tryServer('reanime');
                if (reanimeRes && checkDirect(reanimeRes)) {
                    successResult = reanimeRes;
                }
            }

            // Priority 2: Race remaining specialized anime scrapers if Anivexa was unavailable
            if (!successResult) {
                const animePriorityTier = ['anivexa', 'reanime', 'megaplay_buzz', 'animepahe', 'bing_anime', 'tokyoinsider', 'hianime', 'animesalt', 'vidlink', 'vidrift', 'filmu'];
                successResult = await raceTierForDirectStream(animePriorityTier, 11000);
            }

            // Priority 3: Fallback hubs
            if (!successResult) {
                const animeTier = ['zanix', 'flux', 'vidsrc', 'kisskh', 'asiaflix', 's40', 'framex'];
                successResult = await raceTierForDirectStream(animeTier, 5000);
            }
        } else if (type === 'movie') {
            // Priority sequence for movies:
            // 1. Vidlink (Decrypted 1080p Direct CDN)
            const vidlinkRes = await tryServer('vidlink');
            if (vidlinkRes && checkDirect(vidlinkRes)) {
                successResult = vidlinkRes;
            }

            // 2. Vidrift (Decrypted Multi-Provider HLS)
            if (!successResult) {
                const vidriftRes = await tryServer('vidrift');
                if (vidriftRes && checkDirect(vidriftRes)) {
                    successResult = vidriftRes;
                }
            }

            // 3. Movie 4U (m4u - Direct M3U8 Master)
            if (!successResult) {
                const m4uRes = await tryServer('m4u');
                if (m4uRes && checkDirect(m4uRes)) {
                    successResult = m4uRes;
                }
            }

            // 4. Prism (Multi-Audio 1080p / Direct CDN)
            if (!successResult) {
                const prismRes = await tryServer('prism');
                if (prismRes && checkDirect(prismRes)) {
                    successResult = prismRes;
                }
            }

            // 5. Moscow (s80 - Fast Direct HLS / StreamRip)
            if (!successResult) {
                const s80Res = await tryServer('s80');
                if (s80Res && checkDirect(s80Res)) {
                    successResult = s80Res;
                }
            }

            // 6. Nova (s30 - Direct Fast HLS)
            if (!successResult) {
                const novaRes = await tryServer('s30');
                if (novaRes && checkDirect(novaRes)) {
                    successResult = novaRes;
                }
            }

            // Priority 7: Fast parallel race across prioritized secondary movie sequence
            if (!successResult) {
                const moviePriorityServers = filterTier(['filmu', 'two_embed', 'smashy', 's62', 'flux']);
                successResult = await raceTierForDirectStream(moviePriorityServers, 11000);
            }

            // Fallback: If top priority servers did not yield a direct stream, race the remaining movie servers
            if (!successResult) {
                const remainingMovieServers = ['s31', 'sm_hub', 's70', 'framex', 's81', 's40', 's3', 'vidsrc', 's60', 's63', 's61', 'cinepro'];
                successResult = await raceTierForDirectStream(remainingMovieServers, 4000);
            }
        } else {
            // TV series default cascade:
            // vidlink, vidrift, m4u, prism, s80 (moscow), s30 (nova), etc.
            const tvTier1 = filterTier(['vidlink', 'vidrift', 'm4u', 'prism', 's80', 's30', 'filmu', 'two_embed', 'smashy', 's62']);
            const tvTier2 = ['flux', 's31', 'sm_hub', 's70', 'framex', 's81', 's40', 's3', 'vidsrc', 's60', 's63', 's61'];

            successResult = await raceTierForDirectStream(tvTier1, 11000);
            if (!successResult) {
                successResult = await raceTierForDirectStream(tvTier2, 3500);
            }
        }

        // If direct stream was unavailable, accept fallback embed without checking dead tiers
        if (!successResult && fallbackEmbedResult) {
            successResult = fallbackEmbedResult;
        }
    }

    if (successResult) {
        if (normalizedReqSrv && successResult.serverId && successResult.serverId !== normalizedReqSrv) {
            const reqName = BINGR_SERVERS.find(sv => sv.id === normalizedReqSrv)?.name || normalizedReqSrv;
            const targetSrvName = (successResult.serverName || successResult.serverId || 'Backup Server').split('(')[0].trim();
            (successResult as any).fallbackNote = `${reqName.split('(')[0].trim()} unavailable — connected to ${targetSrvName}`;
        }
        STREAM_CACHE.set(cacheKey, { timestamp: Date.now(), result: { ...successResult, attempts } });
        if (successResult.serverId) {
            const srvKey = `${type}:${tmdbId}:${s}:${e}:${successResult.serverId}:strict`;
            STREAM_CACHE.set(srvKey, { timestamp: Date.now(), result: { ...successResult, attempts } });
        }
        return { ...successResult, attempts };
    }

    const season = params.season || 1;
    const episode = params.episode || 1;

    return {
        success: false,
        type,
        tmdbId: Number(tmdbId),
        title: mediaTitle,
        year: mediaYear,
        ...(type === 'tv' ? { season, episode } : {}),
        error: 'No working stream found across active scraper clusters',
        attempts,
        sources: [],
        fallbackEmbeds: [
            type === 'tv' ? `https://embed.filmu.in/tv/${tmdbId}/${season}/${episode}` : `https://embed.filmu.in/movie/${tmdbId}`,
            type === 'tv' ? `https://www.vidy.st/tv/${tmdbId}/${season}/${episode}` : `https://www.vidy.st/movie/${tmdbId}`,
            type === 'tv' ? `https://player.cinezo.live/embed/tv/${tmdbId}/${season}/${episode}` : `https://player.cinezo.live/embed/movie/${tmdbId}`,
            type === 'tv' ? `https://vidbolt.xyz/tv/${tmdbId}/${season}/${episode}` : `https://vidbolt.xyz/movie/${tmdbId}`,
            type === 'tv' ? `https://embed.vidrift.in/embed/tv/${tmdbId}/${season}/${episode}` : `https://embed.vidrift.in/embed/movie/${tmdbId}`
        ]
    };
}

/**
 * Unwrap any proxy wrapper (local Express proxy or Cloudflare proxy) to raw upstream CDN stream URL
 */
export function unwrapDirectStreamUrl(inputUrl: string): { streamUrl: string; referer?: string; userAgent?: string } {
    if (!inputUrl) return { streamUrl: '' };
    let streamUrl = inputUrl.trim();
    let referer: string | undefined;
    let userAgent: string | undefined;

    // Peel away all nested proxy wrappers (local express proxy, hianime proxy, wormhole, etc.)
    let maxDepth = 10;
    while (maxDepth-- > 0) {
        if (!streamUrl) break;
        let unwrappedInner = false;

        try {
            const parseTarget = streamUrl.startsWith('http://') || streamUrl.startsWith('https://')
                ? streamUrl
                : `http://localhost${streamUrl.startsWith('/') ? '' : '/'}${streamUrl}`;
            const parsed = new URL(parseTarget);
            if (parsed.hostname.includes('framextv.tech') || parsed.hostname.includes('hakunamatata') || parsed.hostname.includes('dash-hls-bridge') || parsed.hostname.includes('workers.dev')) {
                break;
            }

            const isProxyPath = 
                parsed.pathname.includes('/api/proxy') ||
                parsed.pathname.includes('/stream_proxy.php') ||
                parsed.pathname.includes('/proxy/m3u8') ||
                parsed.pathname.includes('/proxy') ||
                parsed.hostname.includes('wormhole.filmu.in') ||
                parsed.hostname.includes('hianime.filmu.in') ||
                parsed.searchParams.has('url');

            const inner = parsed.searchParams.get('url');
            if (inner && (isProxyPath || inner.startsWith('http://') || inner.startsWith('https://'))) {
                streamUrl = inner.trim();
                unwrappedInner = true;

                const refParam = parsed.searchParams.get('referer') || parsed.searchParams.get('ref');
                if (refParam) {
                    referer = refParam.trim();
                }

                const headersParam = parsed.searchParams.get('headers');
                if (headersParam) {
                    try {
                        const parsedHeaders = JSON.parse(decodeURIComponent(headersParam));
                        if (parsedHeaders.Referer || parsedHeaders.referer) {
                            referer = parsedHeaders.Referer || parsedHeaders.referer;
                        }
                        if (parsedHeaders['User-Agent'] || parsedHeaders['user-agent']) {
                            userAgent = parsedHeaders['User-Agent'] || parsedHeaders['user-agent'];
                        }
                    } catch {}
                }
            }
        } catch {}

        if (!unwrappedInner) break;
    }

    if (!referer) {
        const cdn = getCdnHeaders(streamUrl);
        referer = cdn.referer;
        userAgent = userAgent || cdn.userAgent;
    }

    return { streamUrl, referer, userAgent };
}

/**
 * Generate standard IPTV M3U playlist format from scraped Bingr streams
 */
export function buildBingrM3u(options: {
    title: string;
    type: 'movie' | 'tv';
    tmdbId?: number;
    logo?: string;
    groupTitle?: string;
    baseUrl?: string;
    raw?: boolean;
    items: Array<{
        name: string;
        url: string;
        rawUrl?: string;
        directUrl?: string;
        referrer?: string;
        ref?: string;
        userAgent?: string;
        quality?: string;
        logo?: string;
        season?: number;
        episode?: number;
        tmdbId?: number;
    }>;
}): string {
    const lines: string[] = ['#EXTM3U'];
    const defaultGroup = options.groupTitle || (options.type === 'movie' ? 'Bingr Movies' : 'Bingr TV Series');

    for (const item of options.items) {
        const logo = item.logo || options.logo || '';
        const id = item.tmdbId || options.tmdbId || '';
        const qualityTag = item.quality ? ` [${item.quality}]` : '';
        const displayName = `${item.name}${qualityTag}`;
        
        let extraTags = `tvg-id="${id}" tvg-name="${displayName}" group-title="${defaultGroup}"`;
        if (logo) extraTags += ` tvg-logo="${logo}"`;
        if (item.season && item.episode) {
            extraTags += ` tvg-season="${item.season}" tvg-episode="${item.episode}"`;
        }

        lines.push(`#EXTINF:-1 ${extraTags},${displayName}`);
        
        // Extract direct raw stream URL from candidate
        const rawCandidate = item.rawUrl || item.directUrl || item.url;
        const unwrapped = unwrapDirectStreamUrl(rawCandidate);
        let finalStreamUrl = unwrapped.streamUrl || rawCandidate;

        // Route referer-locked streams through manifest normalizer only when raw is NOT requested
        if (!options.raw && requiresReferer(finalStreamUrl) && options.baseUrl && !finalStreamUrl.includes('/api/bingr/manifest.m3u8')) {
            finalStreamUrl = `${options.baseUrl}/api/bingr/manifest.m3u8?url=${encodeURIComponent(finalStreamUrl)}`;
        }

        // Add Kodi and VLC compatible Referer headers for each M3U stream
        const cdn = getCdnHeaders(unwrapped.streamUrl);
        let itemRef = item.referrer || item.ref || unwrapped.referer || cdn.referer;
        let itemUa = item.userAgent || unwrapped.userAgent || cdn.userAgent;

        if (itemRef) {
            lines.push(`#EXTVLCOPT:http-referrer=${itemRef}`);
            lines.push(`#EXTHTTP:{"Referer":"${itemRef}"}`);
        }
        if (itemUa) {
            lines.push(`#EXTVLCOPT:http-user-agent=${itemUa}`);
        }

        lines.push(finalStreamUrl);
    }

    return lines.join('\n');
}

/**
 * Scrape a Movie stream by TMDB ID (Node.js SDK pattern)
 */
export async function scrapeMovie(tmdbId: number | string, options?: { srv?: string; title?: string; year?: string | number }): Promise<BingrScrapeResult> {
    return scrapeBingrStream({
        type: 'movie',
        id: tmdbId,
        title: options?.title,
        year: options?.year,
        srv: options?.srv
    });
}

/**
 * Scrape a TV Series episode stream by TMDB ID, Season, and Episode (Node.js SDK pattern)
 */
export async function scrapeTvEpisode(
    tmdbId: number | string,
    season: number | string,
    episode: number | string,
    options?: { srv?: string; title?: string; year?: string | number }
): Promise<BingrScrapeResult> {
    return scrapeBingrStream({
        type: 'tv',
        id: tmdbId,
        season: Number(season),
        episode: Number(episode),
        title: options?.title,
        year: options?.year,
        srv: options?.srv
    });
}

