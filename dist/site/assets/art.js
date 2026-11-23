/* Ilustraciones SVG en línea (no dependen de imágenes externas) */
window.ART = (function(){
  const F = 'font-family="Roboto,Segoe UI,Arial,sans-serif"';
  const box = (x,y,w,h,t,fill,col='#fff',fs=14,sub='')=>
    `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}"/>
    <text x="${x+w/2}" y="${y+h/2+(sub?-4:5)}" text-anchor="middle" fill="${col}" font-size="${fs}" font-weight="600" ${F}>${t}</text>
    ${sub?`<text x="${x+w/2}" y="${y+h/2+14}" text-anchor="middle" fill="${col}" opacity=".85" font-size="11" ${F}>${sub}</text>`:''}</g>`;
  const arrow = (x1,y1,x2,y2,c='#5b6678')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2.5" marker-end="url(#ah)"/>`;
  const defs = `<defs><marker id="ah" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 z" fill="#5b6678"/></marker></defs>`;
  const svg = (w,h,inner)=>`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">${defs}${inner}</svg>`;

  const motherboard = () => svg(600,420,`
    <rect x="20" y="14" width="560" height="392" rx="10" fill="#0f5a3f" stroke="#1ea06d" stroke-width="3"/>
    <g stroke="#2fd392" stroke-width="1" opacity=".35" fill="none"><path d="M40 60H260M40 80H220M300 380H560M420 40V120"/></g>
    <!-- Panel trasero I/O -->
    <g data-id="io"><rect x="20" y="36" width="82" height="170" fill="#8aa1b8" stroke="#cfe0f0"/><text x="61" y="125" fill="#1f232c" font-size="14" font-weight="700" text-anchor="middle" ${F} transform="rotate(-90 61 125)">PANEL I/O</text></g>
    <!-- Disipador VRM -->
    <rect x="120" y="30" width="120" height="22" rx="4" fill="#3a4a5c"/>
    <!-- Socket CPU -->
    <g data-id="cpu"><rect x="150" y="70" width="130" height="130" rx="8" fill="#c9d1da" stroke="#fff" stroke-width="2"/><rect x="172" y="92" width="86" height="86" rx="4" fill="#7b8794"/><text x="215" y="140" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" ${F}>CPU</text></g>
    <g data-id="fan"><circle cx="215" cy="218" r="8" fill="#e5b84a"/><text x="230" y="222" fill="#fff" font-size="11" ${F}>CPU_FAN</text></g>
    <!-- RAM -->
    <g data-id="ram"><rect x="310" y="48" width="14" height="170" rx="3" fill="#2c3e50" stroke="#ffd166"/><rect x="334" y="48" width="14" height="170" rx="3" fill="#2c3e50" stroke="#ffd166"/><rect x="358" y="48" width="14" height="170" rx="3" fill="#2c3e50" stroke="#ffd166"/><rect x="382" y="48" width="14" height="170" rx="3" fill="#2c3e50" stroke="#ffd166"/><text x="353" y="240" text-anchor="middle" fill="#ffd166" font-size="13" font-weight="700" ${F}>RAM</text></g>
    <!-- 24 pin -->
    <g data-id="atx"><rect x="430" y="48" width="38" height="130" rx="4" fill="#f4f4f4"/><g fill="#999"><rect x="436" y="56" width="10" height="8"/><rect x="452" y="56" width="10" height="8"/><rect x="436" y="72" width="10" height="8"/><rect x="452" y="72" width="10" height="8"/><rect x="436" y="88" width="10" height="8"/><rect x="452" y="88" width="10" height="8"/><rect x="436" y="104" width="10" height="8"/><rect x="452" y="104" width="10" height="8"/></g><text x="449" y="198" text-anchor="middle" fill="#fff" font-size="11" ${F}>ATX 24 pin</text></g>
    <!-- Chipset -->
    <g data-id="chipset"><rect x="390" y="270" width="64" height="64" rx="6" fill="#3a4a5c" stroke="#9fb3c8"/><text x="422" y="307" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" ${F}>CHIPSET</text></g>
    <!-- PCIe -->
    <g data-id="pcie"><rect x="120" y="262" width="230" height="16" rx="3" fill="#111"/><rect x="120" y="300" width="150" height="14" rx="3" fill="#111"/><rect x="120" y="336" width="230" height="16" rx="3" fill="#111"/><text x="300" y="327" fill="#9fe7c8" font-size="12" ${F}>Ranuras PCIe</text></g>
    <!-- M.2 -->
    <g data-id="m2"><rect x="120" y="238" width="90" height="14" rx="3" fill="#566074"/><text x="216" y="250" fill="#fff" font-size="11" ${F}>M.2</text></g>
    <!-- SATA -->
    <g data-id="sata"><rect x="475" y="270" width="26" height="14" fill="#e35d5d"/><rect x="505" y="270" width="26" height="14" fill="#e35d5d"/><rect x="475" y="290" width="26" height="14" fill="#e35d5d"/><rect x="505" y="290" width="26" height="14" fill="#e35d5d"/><text x="503" y="324" text-anchor="middle" fill="#fff" font-size="11" ${F}>SATA</text></g>
    <!-- Batería -->
    <g data-id="bat"><circle cx="370" cy="372" r="22" fill="#cfd6de" stroke="#fff" stroke-width="2"/><text x="370" y="377" text-anchor="middle" fill="#2c3e50" font-size="11" font-weight="700" ${F}>CR2032</text></g>
    <!-- Panel frontal -->
    <g data-id="fpanel"><rect x="470" y="352" width="90" height="34" rx="4" fill="#222"/><g fill="#ffd166"><circle cx="486" cy="362" r="3"/><circle cx="500" cy="362" r="3"/><circle cx="514" cy="362" r="3"/><circle cx="528" cy="362" r="3"/><circle cx="486" cy="376" r="3"/><circle cx="500" cy="376" r="3"/><circle cx="514" cy="376" r="3"/><circle cx="528" cy="376" r="3"/></g><text x="515" y="398" text-anchor="middle" fill="#fff" font-size="10" ${F}>F_PANEL</text></g>
    <!-- BIOS chip -->
    <g data-id="bios"><rect x="296" y="360" width="44" height="26" rx="3" fill="#1a1a1a" stroke="#888"/><text x="318" y="377" text-anchor="middle" fill="#8ee7ff" font-size="10" font-weight="700" ${F}>BIOS</text></g>`);

  const flow = () => svg(760,190,`
    ${[['1','Identificar','el problema','#2e3340'],['2','Teoría','causa probable','#e07a2c'],['3','Probar','la teoría','#566074'],['4','Plan de','acción','#f2a65a'],['5','Implementar','y verificar','#1e9e5a'],['6','Documentar','hallazgos','#1f232c']].map((s,i)=>
      `<g><rect x="${14+i*124}" y="40" width="108" height="100" rx="14" fill="${s[3]}"/><circle cx="${68+i*124}" cy="40" r="17" fill="#fff" stroke="${s[3]}" stroke-width="3"/><text x="${68+i*124}" y="46" text-anchor="middle" font-size="16" font-weight="700" fill="${s[3]}" ${F}>${s[0]}</text><text x="${68+i*124}" y="86" text-anchor="middle" fill="#fff" font-size="14" font-weight="600" ${F}>${s[1]}</text><text x="${68+i*124}" y="106" text-anchor="middle" fill="#fff" font-size="12" ${F}>${s[2]}</text></g>${i<5?arrow(124+i*124,90,136+i*124,90):''}`).join('')}
    <text x="380" y="176" text-anchor="middle" fill="#5b6678" font-size="12" ${F}>Si la prueba falla, vuelve al paso 2 con una nueva teoría</text>`);

  const post = () => svg(760,150,`
    ${[['Encendido','PSU entrega energía','#f2a65a'],['POST','Prueba de hardware','#2e3340'],['BIOS/UEFI','Busca dispositivo de arranque','#566074'],['Gestor de arranque','Carga el sistema','#e07a2c'],['Sistema operativo','Escritorio listo','#1e9e5a']].map((s,i)=>
      box(8+i*152,34,134,76,s[0],s[2],'#fff',13,s[1].length>20?'':s[1])+(i<4?arrow(142+i*152,72,158+i*152,72):'')).join('')}
    <text x="380" y="140" text-anchor="middle" fill="#5b6678" font-size="12" ${F}>Un fallo en cada etapa produce síntomas distintos: sin energía, pitidos, “No bootable device”, pantalla azul…</text>`);

  const network = () => svg(760,210,`
    ${box(20,70,120,70,'💻 PC','#2e3340','#fff',16,'192.168.1.25')}
    ${box(220,70,130,70,'📡 Router','#566074','#fff',16,'Puerta: 192.168.1.1')}
    ${box(430,70,120,70,'🌐 DNS','#e07a2c','#fff',16,'8.8.8.8')}
    ${box(630,70,110,70,'☁️ Internet','#1e9e5a','#fff',16)}
    ${arrow(140,105,218,105)}${arrow(350,105,428,105)}${arrow(550,105,628,105)}
    <text x="180" y="62" text-anchor="middle" font-size="12" fill="#5b6678" ${F}>ping 192.168.1.1</text>
    <text x="490" y="62" text-anchor="middle" font-size="12" fill="#5b6678" ${F}>nslookup</text>
    <text x="380" y="185" text-anchor="middle" font-size="13" fill="#1f232c" font-weight="600" ${F}>Prueba de adentro hacia afuera: PC → router → DNS → Internet</text>`);

  const remote = () => svg(760,230,`
    ${box(20,60,180,100,'🧑‍💻 Técnico','#2e3340','#fff',16,'Controla el equipo')}
    ${box(290,20,180,60,'🔒 Servidores AnyDesk','#ef443b','#fff',14,'Conexión cifrada')}
    ${box(560,60,180,100,'🧑 Usuario','#1e9e5a','#fff',16,'Comparte su ID y acepta')}
    ${arrow(200,90,288,52)}${arrow(470,52,558,90)}
    <line x1="200" y1="135" x2="558" y2="135" stroke="#ff8a3d" stroke-width="3" stroke-dasharray="7 6"/>
    <text x="380" y="125" text-anchor="middle" fill="#c4600f" font-size="12" ${F}>sesión remota (pantalla, teclado, mouse, archivos)</text>
    <text x="380" y="200" text-anchor="middle" fill="#5b6678" font-size="13" ${F}>El usuario SIEMPRE debe aceptar la conexión y puede cortarla cuando quiera</text>`);

  const levels = () => svg(760,220,`
    <polygon points="380,14 640,200 120,200" fill="#fdf0e4" stroke="#e07a2c" stroke-width="2"/>
    <polygon points="380,14 480,86 280,86" fill="#566074"/><text x="380" y="68" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" ${F}>N3</text>
    <polygon points="280,86 480,86 560,144 200,144" fill="#e07a2c"/><text x="380" y="122" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" ${F}>N2 · Especialista</text>
    <polygon points="200,144 560,144 640,200 120,200" fill="#2e3340"/><text x="380" y="178" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" ${F}>N1 · Mesa de ayuda (primer contacto)</text>
    <text x="660" y="60" font-size="12" fill="#5b6678" ${F}>Ingeniería /</text><text x="660" y="76" font-size="12" fill="#5b6678" ${F}>proveedor</text>
    <text x="10" y="120" font-size="12" fill="#5b6678" ${F}>Menos casos,</text><text x="10" y="136" font-size="12" fill="#5b6678" ${F}>más complejos ↑</text>`);

  const build = () => svg(760,170,`
    ${['Gabinete','Fuente','CPU','Disipador','RAM','Placa en gabinete','Disco','Cables','Prueba'].map((t,i)=>
      `<g><circle cx="${48+i*83}" cy="70" r="26" fill="${i%2?'#2e3340':'#e07a2c'}"/><text x="${48+i*83}" y="76" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" ${F}>${i+1}</text><text x="${48+i*83}" y="120" text-anchor="middle" fill="#1f232c" font-size="11" ${F}>${t}</text></g>${i<8?arrow(76+i*83,70,94+i*83,70):''}`).join('')}`);

  const map = {motherboard,flow,post,network,remote,levels,build};

  const spots = {
    motherboard:{
      cpu:['Socket del procesador (CPU)','El “cerebro”: ejecuta instrucciones. Se sujeta con una palanca; los pines/contactos son delicados. Lleva pasta térmica y disipador encima.'],
      fan:['Conector CPU_FAN','Alimenta y controla el ventilador del procesador. Si no está conectado, la placa avisa “CPU Fan Error” y puede apagarse por calor.'],
      ram:['Ranuras de memoria RAM','Memoria de trabajo temporal. Los módulos entran en una sola posición (muesca). Para doble canal se usan ranuras alternas (consulta el manual).'],
      atx:['Conector ATX de 24 pines','Aquí llega la energía principal desde la fuente de poder. Una mala conexión impide el encendido.'],
      chipset:['Chipset','Coordina la comunicación entre CPU, almacenamiento, USB y ranuras. Suele tener un pequeño disipador.'],
      pcie:['Ranuras PCI Express','Para tarjeta de video, red, sonido o capturadoras. La más larga (x16) es normalmente para la GPU.'],
      m2:['Ranura M.2','Para SSD NVMe/SATA tipo “chicle”. Se fija con un tornillo pequeño. ¡Revisa la compatibilidad!'],
      sata:['Puertos SATA','Para discos duros y SSD de 2.5"/3.5" y unidades ópticas mediante cable de datos.'],
      bat:['Batería CR2032','Mantiene la hora y la configuración de la BIOS. Si falla, la fecha se reinicia en cada apagado. Para “resetear” la BIOS se retira unos minutos.'],
      bios:['Chip de BIOS/UEFI','Memoria flash con el firmware que arranca la PC (POST) y guarda la configuración básica.'],
      fpanel:['Header de panel frontal','Pines para botón de encendido, reset y LEDs. Mirar el diagrama impreso en la placa o el manual.'],
      io:['Panel I/O trasero','USB, red RJ45, audio, video (HDMI/DP). Es la “cara externa” de la placa.']
    }
  };
  return {map,spots};
})();
