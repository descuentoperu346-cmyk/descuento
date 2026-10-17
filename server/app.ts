import express, { Request, Response, NextFunction } from 'express';
import { sessionMiddleware } from './session';
import { authRouter } from './routes/auth';
import { productsRouter } from './routes/products';
import { vendorsRouter } from './routes/vendors';
import { syncRouter } from './routes/sync';

export const app = express();

// Middleware básico de parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Middleware de sesión opaca
app.use(sessionMiddleware as express.RequestHandler);

// Endpoint de salud del servidor (sin exponer datos de infraestructura)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Descuentos Perú Backend API',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de simulacion y telemetria del sistema Honeypot (Active Cyber Deception)
app.get('/api/honeypot-preview', (req: Request, res: Response) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Desconocido / Raw Socket Probe';

  const honeypotData = {
    system: 'DESCUENTOS_PERU_DECEPTION_ENGINE',
    international_node_ref: 'INTERPOL-GL-CYBER-KISA-CERT-BR-089',
    operation_codename: 'OP_SENTINEL_TRIPWIRE_2026',
    targetDatabase: 'https://mgoufbntqyksunablrzb.supabase.co',
    status: 'ACTIVE_INTERCEPTION_SANDBOX',
    timestamp: new Date().toISOString(),
    korean_security_notice: '[경고] 비인가 네트워크 침입 탐지 시스템 활성화됨 (국가사이버안보센터 KISA-CERT 긴급 추적 공조). 귀하의 IP 주소 및 하드웨어 핑거프린트 패킷이 포렌식 데이터베이스에 영구 보존되었습니다.',
    portuguese_security_notice: 'AVISO JUDICIAL E POLICIAL (DCCIBER / POLÍCIA FEDERAL / CERT.br): Conforme a Lei N° 12.965/14 (Marco Civil da Internet) e o Tratado de Budapeste contra o Cibercrime, toda a rota de tráfego, headers HTTP e payloads desta requisição foram interceptados e transferidos para perícia técnica forense.',
    legal_statute_peru: 'LEY N° 30096: Artículos 2, 3 y 11 sobre acceso ilícito, atentado contra la integridad de datos informáticos e interceptación no consentida.',
    tables: {
      auth_privileged_identities: [
        {
          identity_id: 'usr_sec_admin_09',
          username: 'sec-operations-lead',
          password_digest: '$argon2id$v=19$m=65536,t=3,p=4$CANARY_TOKEN_TRIPWIRE_TRIGGERED',
          access_level: 'L3_RESTRICTED',
          korean_tag: '특수인가자_계정_유인노드',
          portuguese_classification: 'CREDENCIAL_MONITORADA_DECOY',
          canary_token_id: 'CANARY-KOREA-BR-PE-9941',
          incident_action: 'ENVIADO_AO_MINISTERIO_PUBLICO / 법적대응_데이터베이스_이관'
        },
        {
          identity_id: 'usr_svc_clearing_sync',
          username: 'service-payment-gateway',
          password_digest: '$argon2id$v=19$m=65536,t=3,p=4$TRAP_HASH_NOT_AUTHENTIC',
          access_level: 'AUTOMATED_INGESTION',
          korean_tag: '결제게이트웨이_더미_엔드포인트',
          portuguese_classification: 'CANAL_ISOLADO_EM_SANDBOX',
          canary_token_id: 'CANARY-SETTLE-4482',
          incident_action: 'RASTREAMENTO_EM_TEMPO_REAL'
        }
      ],
      financial_clearing_settlement: [
        {
          batch_reference: 'SETTLE-BATCH-2026-10-8841',
          clearing_house: 'BANCO_CENTRAL_CLEARING_INTERMEDIARY',
          masked_account: 'PE-CCI-002-194-000000000000-88',
          amount_settled: 'PEN 142,850.00',
          korean_status: '자금세탁방지_실시간_추적중 (AML/CFT-ACTIVE)',
          portuguese_status: 'RETENCAO_JUDICIAL_PREVENTIVA_ACINADA',
          trap_signature: 'SIG_CANARY_INTEGRITY_CHECK_FAILED'
        }
      ],
      vault_service_tokens: [
        {
          scope: 'SUPABASE_SERVICE_ROLE_DECOY',
          token_identifier: 'dp_live_sec_canary_token_88f912c4ba91448',
          issued_to: 'CI_DEPLOYMENT_DECOY_PIPELINE',
          korean_audit_rule: '불법복제_시_국제사이버수사팀_자동전송',
          portuguese_audit_rule: 'TOKEN_INATIVO_COM_DISPARADOR_FORENSE',
          verification_url: 'https://descuentosperu.pe/api/security/canary-tripwire'
        }
      ],
      security_incident_ledger: [
        {
          incident_id: 'INC-2026-' + Math.floor(100000 + Math.random() * 900000),
          detection_vector: 'REST_PROBE_UNAUTHORIZED_ACCESS',
          threat_classification: 'MITRE_ATTACK_T1190_EXPLOIT_PUBLIC_FACING_APPLICATION',
          korean_threat_level: '심각_1급_경보 (CRITICAL_ALERT)',
          portuguese_threat_level: 'ALERTA_VERMELHO_INVASAO_DETECTADA',
          probe_source_ip: clientIp,
          probe_user_agent: userAgent,
          mitigation_response: '역추적_실행_포렌식_증거_봉인 / CONTENCAO_IMEDIATA_ENCAMINHAMENTO_POLICIAL'
        }
      ]
    }
  };

  // Respuesta JSON estructurada si se invoca por API/CLI
  if (req.headers.accept && req.headers.accept.includes('application/json') && !req.query.view) {
    res.json(honeypotData);
    return;
  }

  // Interfaz formal de telemetria SOC / Cyber Deception
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>DECEPTION TELEMETRY INTERFACE | Descuentos Peru Cyber Defense</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg: #070a12;
      --surface: #0e1526;
      --surface-border: #1e293b;
      --text-main: #f1f5f9;
      --text-muted: #64748b;
      --accent-cyan: #0ea5e9;
      --accent-red: #ef4444;
      --accent-amber: #f59e0b;
      --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font-mono); }
    body {
      background: var(--bg);
      color: var(--text-main);
      padding: 2.5rem 1.5rem;
      min-height: 100vh;
      line-height: 1.5;
    }
    .wrapper { max-width: 1100px; margin: 0 auto; }
    
    .panel-header {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-top: 3px solid var(--accent-red);
      border-radius: 6px;
      padding: 1.75rem;
      margin-bottom: 2rem;
    }
    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .tag {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .tag-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    .tag-cyan { background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.4); }
    .tag-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .tag-neutral { background: rgba(100, 116, 139, 0.2); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3); }

    h1 {
      font-size: 1.3rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }
    .metadata-line {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .notice-box {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid #1e293b;
      border-radius: 4px;
      padding: 1rem;
      margin-top: 1rem;
      font-size: 0.8125rem;
    }
    .notice-korean {
      border-left: 3px solid var(--accent-red);
      color: #fca5a5;
      margin-bottom: 0.75rem;
    }
    .notice-portuguese {
      border-left: 3px solid var(--accent-amber);
      color: #fde68a;
      margin-bottom: 0.75rem;
    }
    .notice-spanish {
      border-left: 3px solid var(--accent-cyan);
      color: #bae6fd;
    }

    .nav-actions {
      margin-top: 1.25rem;
      display: flex;
      gap: 12px;
    }
    .action-link {
      display: inline-block;
      font-size: 0.8125rem;
      font-weight: 600;
      text-decoration: none;
      padding: 8px 14px;
      border-radius: 4px;
      transition: background 0.15s ease;
    }
    .action-primary {
      background: var(--surface-border);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .action-primary:hover { background: #334155; }
    .action-secondary {
      background: transparent;
      color: var(--accent-cyan);
      border: 1px solid rgba(14, 165, 233, 0.4);
    }
    .action-secondary:hover { background: rgba(14, 165, 233, 0.1); }

    .section-title {
      font-size: 0.95rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .grid { display: grid; gap: 1.5rem; }
    .block {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      padding: 1.25rem;
    }
    .block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .block-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--accent-cyan);
    }
    .block-meta {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    pre {
      background: #04070f;
      border: 1px solid #161f30;
      border-radius: 4px;
      padding: 1rem;
      font-size: 0.8rem;
      color: #e2e8f0;
      overflow-x: auto;
      line-height: 1.45;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="panel-header">
      <div class="status-bar">
        <div>
          <span class="tag tag-danger">THREAT_INTERCEPT: ACTIVE</span>
          <span class="tag tag-amber" style="margin-left: 6px;">포렌식_추적_가동중</span>
          <span class="tag tag-cyan" style="margin-left: 6px;">RASTREIO_POLICIAL_ATIVO</span>
        </div>
        <span class="tag tag-neutral">HTTP 200 PROBE LOGGED</span>
      </div>

      <h1>SISTEMA INTEGRADO DE CONTRA-INTELIGENCIA CIBERNETICA (DECEPTION NODE)</h1>
      <div class="metadata-line">
        NODE: <code>INTERPOL-GL-CYBER-KISA-CERT-BR-089</code> | DATABASE: <code>https://mgoufbntqyksunablrzb.supabase.co</code> | POSTGREST 12.0.2
      </div>

      <div class="notice-box notice-korean">
        <strong>[대한민국 사이버안보센터 KISA-CERT 긴급 경보]:</strong> 비인가 불법 침입 시도가 감지되었습니다. 모든 송수신 패킷, 출발지 IP 주소, TLS 핸드셰이크 핑거프린트 및 시스템 호출 이력이 국제형사경찰기구(INTERPOL) 디지털 포렌식 데이터베이스에 영구 보존되었습니다.
      </div>

      <div class="notice-box notice-portuguese">
        <strong>[AVISO DCCIBER / POLÍCIA FEDERAL DO BRASIL / CERT.br]:</strong> Conforme a Lei N° 12.965/14 (Marco Civil da Internet) e o Tratado de Budapeste, a atividade deste terminal foi interceptada por um nó señuelo de contenção forense. O inquérito policial e o rastreamento de roteamento BGP foram automaticamente protocolados.
      </div>

      <div class="notice-box notice-spanish">
        <strong>[AVISO POLICIAL PNP - DIVINDAT / LEY N° 30096]:</strong> Sistema trampa bajo custodia pericial. El acceso ilícito a sistemas informáticos acarrea responsabilidad penal de acuerdo a la legislación vigente.
      </div>

      <div class="nav-actions">
        <a href="/" class="action-link action-primary">&larr; Retornar a la Aplicacion Principal</a>
        <a href="/api/honeypot-preview?format=json" class="action-link action-secondary">Exportar Telemetria JSON (Forensic Dump)</a>
      </div>
    </div>

    <div class="section-title">
      Tablas Senuelo Monitoreadas con Disparadores Canario
    </div>

    <div class="grid">
      <div class="block">
        <div class="block-header">
          <span class="block-name">public.auth_privileged_identities</span>
          <span class="block-meta">특수인가자_계정_유인노드 | CREDENCIAL_MONITORADA_DECOY</span>
        </div>
        <pre>${JSON.stringify(honeypotData.tables.auth_privileged_identities, null, 2)}</pre>
      </div>

      <div class="block">
        <div class="block-header">
          <span class="block-name">public.financial_clearing_settlement</span>
          <span class="block-meta">자금세탁방지_실시간_추적 | LIQUIDACAO_JUDICIAL_INTERBANCARIA</span>
        </div>
        <pre>${JSON.stringify(honeypotData.tables.financial_clearing_settlement, null, 2)}</pre>
      </div>

      <div class="block">
        <div class="block-header">
          <span class="block-name">public.vault_service_tokens</span>
          <span class="block-meta">불법복제_추적_토큰 | DISPARADOR_FORENSE_CERT_BR</span>
        </div>
        <pre>${JSON.stringify(honeypotData.tables.vault_service_tokens, null, 2)}</pre>
      </div>

      <div class="block">
        <div class="block-header">
          <span class="block-name">public.security_incident_ledger</span>
          <span class="block-meta" style="color: var(--accent-red);">실시간_침입_포렌식_기록 | REGISTRO_CRIME_CIBERNETICO</span>
        </div>
        <pre>${JSON.stringify(honeypotData.tables.security_incident_ledger, null, 2)}</pre>
      </div>
    </div>
  </div>
</body>
</html>`);
});

// Rutas de la API de la aplicación
app.use('/api/auth', authRouter);
app.use('/api/productos', productsRouter);
app.use('/api/vendedores', vendorsRouter);
app.use('/api/sync', syncRouter);

// Manejador de errores seguro: NUNCA expone credenciales, cadenas de conexión ni trazas
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err?.message || err);
  res.status(500).json({
    success: false,
    error: 'Ocurrió un error interno en el servidor. Por favor intenta más tarde.'
  });
});
