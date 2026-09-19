import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// 4K Ultra-Sharp Procedural Vector Texture Generator
function generateCrispWorldCanvas(geojsonData) {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  // 1. Smooth, Matte Studio Gradient (No Blown-Out Flashlight Spotlights)
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGradient.addColorStop(0.0, '#475569'); // Clean slate steel
  oceanGradient.addColorStop(0.5, '#334155'); // Deep balanced graphite
  oceanGradient.addColorStop(1.0, '#1e293b'); // Dark grounded base
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle longitude & latitude precision grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= canvas.width; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const toCanvas = (lng, lat) => [
    ((lng + 180) / 360) * canvas.width,
    ((90 - lat) / 180) * canvas.height
  ];

  // 2. Razor-Sharp Solid Continent Vector Filling
  if (geojsonData && geojsonData.features) {
    geojsonData.features.forEach(feature => {
      if (!feature.geometry) return;
      const { type, coordinates } = feature.geometry;

      const fillPolygon = (rings) => {
        ctx.beginPath();
        rings.forEach((ring) => {
          ring.forEach(([lng, lat], idx) => {
            const [x, y] = toCanvas(lng, lat);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
        });
        ctx.closePath();

        // Solid Satin White/Platinum Landmasses
        ctx.fillStyle = '#f8fafc';
        ctx.fill();

        // Dark, High-Contrast National Boundary Contours
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.4;
        ctx.stroke();
      };

      if (type === 'Polygon') {
        fillPolygon(coordinates);
      } else if (type === 'MultiPolygon') {
        coordinates.forEach(poly => fillPolygon(poly));
      }
    });
  }

  return canvas;
}

// High-DPI Country Billboard Sprites
function createCrispTextSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.font = '800 38px "Segoe UI", -apple-system, monospace';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowBlur = 8;
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95,
    depthTest: true,
    depthWrite: false
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.34, 0.085, 1);
  return sprite;
}

export default function CyberGlobe({ alerts = [], selectedAlert, onSelectAlert, theme = 'dark' }) {
  const mountRef = useRef(null);
  const [hoveredServer, setHoveredServer] = useState(null);
  const [pinnedServer, setPinnedServer] = useState(null);
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });

  const activeServer = hoveredServer || pinnedServer;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isMounted = true;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera & Anti-Aliased Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5)); // High-DPI sharpness
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const latLngToVector3 = (lat, lng, radius = 2.015) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    // 2. Matte Studio Material (Roughness: 0.88 prevents any flashlight glare)
    const sphereGeo = new THREE.SphereGeometry(2, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      roughness: 0.88,
      metalness: 0.05,
    });
    const earthMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(earthMesh);

    // Fetch and Apply 4K Sharp Vector Texture
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then(res => res.json())
      .then(geojson => {
        if (!isMounted) return;
        const worldCanvas = generateCrispWorldCanvas(geojson);
        const texture = new THREE.CanvasTexture(worldCanvas);
        
        // 16x Anisotropic filtering eliminates blur on edges
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        
        sphereMat.map = texture;
        sphereMat.needsUpdate = true;

        // 3D Vector Boundary Outlines
        const borderMat = new THREE.LineBasicMaterial({ 
          color: 0x0f172a,
          transparent: true, 
          opacity: 0.85,
          linewidth: 2
        });

        const drawRing = (ring) => {
          if (!Array.isArray(ring) || ring.length < 2) return;
          const points = ring
            .filter(c => Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1]))
            .map(coord => latLngToVector3(coord[1], coord[0], 2.012));
          if (points.length >= 2) {
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            globeGroup.add(new THREE.Line(geo, borderMat));
          }
        };

        geojson.features.forEach(feature => {
          if (!feature.geometry) return;
          const { type, coordinates } = feature.geometry;
          if (type === 'Polygon') coordinates.forEach(drawRing);
          else if (type === 'MultiPolygon') coordinates.forEach(poly => poly.forEach(drawRing));
        });
      })
      .catch(() => {});

    // 3. Country Name Labels
    const countryLabels = [
      { name: "USA", lat: 39.8, lng: -98.5 },
      { name: "CANADA", lat: 56.1, lng: -106.3 },
      { name: "MEXICO", lat: 23.6, lng: -102.5 },
      { name: "BRAZIL", lat: -10.2, lng: -53.2 },
      { name: "ARGENTINA", lat: -38.4, lng: -63.6 },
      { name: "UK", lat: 54.5, lng: -2.2 },
      { name: "GERMANY", lat: 51.1, lng: 10.4 },
      { name: "FRANCE", lat: 46.6, lng: 2.2 },
      { name: "SPAIN", lat: 40.4, lng: -3.7 },
      { name: "ITALY", lat: 41.8, lng: 12.5 },
      { name: "NETHERLANDS", lat: 52.3, lng: 5.3 },
      { name: "RUSSIA", lat: 60.5, lng: 95.0 },
      { name: "INDIA", lat: 21.0, lng: 78.9 },
      { name: "CHINA", lat: 35.8, lng: 104.1 },
      { name: "SINGAPORE", lat: 1.3, lng: 103.8 },
      { name: "JAPAN", lat: 36.2, lng: 138.2 },
      { name: "AUSTRALIA", lat: -25.2, lng: 133.7 },
      { name: "UAE", lat: 23.4, lng: 53.8 },
      { name: "SOUTH AFRICA", lat: -30.5, lng: 22.9 },
      { name: "EGYPT", lat: 26.8, lng: 30.8 },
      { name: "NIGERIA", lat: 9.0, lng: 8.6 },
      { name: "TURKEY", lat: 38.9, lng: 35.2 },
      { name: "PANAMA", lat: 8.5, lng: -80.7 }
    ];

    const labelSprites = [];
    countryLabels.forEach(c => {
      const labelPos = latLngToVector3(c.lat, c.lng, 2.035);
      const sprite = createCrispTextSprite(c.name);
      sprite.position.copy(labelPos);
      sprite.userData = { normal: labelPos.clone().normalize() };
      globeGroup.add(sprite);
      labelSprites.push(sprite);
    });

    // 4. Uniform Studio Hemisphere Lighting (Uniform Clarity, Zero Specular Hotspots)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x64748b, 1.8);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // 5. Server Nodes & Radar Rings
    const markerMeshes = [];
    alerts.forEach((alert) => {
      if (alert.lat == null || alert.lng == null) return;
      const pos = latLngToVector3(alert.lat, alert.lng, 2.025);

      const pinColor = alert.risk > 0.9 ? 0xef4444 : (alert.risk > 0.75 ? 0xf59e0b : 0x10b981);
      const pinRadius = 0.048;

      const markerGeo = new THREE.SphereGeometry(pinRadius, 20, 20);
      const markerMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      marker.userData = alert;
      globeGroup.add(marker);
      markerMeshes.push(marker);

      const ringGeo = new THREE.RingGeometry(pinRadius + 0.015, pinRadius + 0.038, 28);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ring);
    });

    // Dynamic Arc Group
    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    const updateArcsFor = (target) => {
      arcGroup.clear();
      if (!target || target.lat == null) return;

      const srcPos = latLngToVector3(target.lat, target.lng, 2.025);
      alerts.forEach(peer => {
        if (peer.txid === target.txid || peer.lat == null) return;
        const dstPos = latLngToVector3(peer.lat, peer.lng, 2.025);
        const mid = new THREE.Vector3().addVectors(srcPos, dstPos).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(2.68);

        const curve = new THREE.QuadraticBezierCurve3(srcPos, mid, dstPos);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(45));
        const arcMat = new THREE.LineBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.9,
          linewidth: 2.5
        });
        arcGroup.add(new THREE.Line(arcGeo, arcMat));
      });
    };

    // 6. Interaction Controls
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isUserInteracting = false;
    let isDragging = false;
    let prev = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      isUserInteracting = true;
      prev = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerMeshes);

      if (intersects.length > 0) {
        isUserInteracting = true;
        const hovered = intersects[0].object.userData;
        setHoveredServer(hovered);
        updateArcsFor(hovered);
        setCardPos({
          x: Math.min(e.clientX + 16, window.innerWidth - 330),
          y: Math.min(e.clientY - 25, window.innerHeight - 360)
        });
      } else {
        setHoveredServer(null);
        if (!isDragging && !pinnedServer) {
          isUserInteracting = false;
          arcGroup.clear();
        }
      }

      if (!isDragging) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      globeGroup.rotation.y += dx * 0.005;
      globeGroup.rotation.x += dy * 0.005;
      prev = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };
    const onMouseLeave = () => {
      isDragging = false;
      isUserInteracting = false;
      setHoveredServer(null);
      if (!pinnedServer) arcGroup.clear();
    };

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.003;
      camera.position.z = Math.min(Math.max(camera.position.z, 2.7), 8.5);
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerMeshes);
      if (intersects.length > 0) {
        const clickedData = intersects[0].object.userData;
        setPinnedServer(clickedData);
        updateArcsFor(clickedData);
        if (onSelectAlert) onSelectAlert(clickedData);
      } else {
        setPinnedServer(null);
        arcGroup.clear();
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);

    // 7. Render & Auto-Spin Loop
    let animId;
    const cameraWorldDir = new THREE.Vector3();
    const spriteWorldNormal = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isUserInteracting && !isDragging) {
        globeGroup.rotation.y += 0.0012;
      }

      camera.getWorldDirection(cameraWorldDir);
      labelSprites.forEach(sprite => {
        spriteWorldNormal.copy(sprite.userData.normal).applyEuler(globeGroup.rotation);
        const dot = -cameraWorldDir.dot(spriteWorldNormal);
        sprite.material.opacity = dot > 0.25 ? Math.min(0.95, (dot - 0.25) * 2) : 0;
      });

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [alerts]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {activeServer && (
        <div style={{
          ...styles.serverInspectionCard,
          top: cardPos.y,
          left: cardPos.x,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderColor: '#0284c7',
          color: '#0f172a',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
        }}>
          <div style={{ ...styles.cardHeader, borderColor: 'rgba(148, 163, 184, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '9px', height: '9px', borderRadius: '50%',
                backgroundColor: activeServer.risk > 0.9 ? '#ef4444' : '#f59e0b'
              }} />
              <span style={{ fontWeight: 'bold', fontSize: '0.80rem' }}>RELAY NODE TELEMETRY</span>
            </div>
            {pinnedServer && (
              <button 
                onClick={() => { setPinnedServer(null); setHoveredServer(null); }} 
                style={styles.closeCardBtn}
              >
                ✕
              </button>
            )}
          </div>

          <div style={styles.cardBody}>
            <div style={styles.dataRow}>
              <span style={{ ...styles.label, color: '#64748b' }}>Location:</span>
              <span style={{ fontWeight: '700', color: '#0284c7' }}>{activeServer.country}</span>
            </div>
            <div style={styles.dataRow}>
              <span style={{ ...styles.label, color: '#64748b' }}>Server IP / ASN:</span>
              <span style={{ fontWeight: '600' }}>{activeServer.ip} ({activeServer.asn ? activeServer.asn.split(' ')[0] : 'AS13335'})</span>
            </div>
            <div style={{ margin: '4px 0', borderTop: '1px solid rgba(0,0,0,0.08)' }} />
            <div style={styles.dataRow}>
              <span style={{ ...styles.label, color: '#64748b' }}>Typology:</span>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{activeServer.typology}</span>
            </div>
            <div style={styles.dataRow}>
              <span style={{ ...styles.label, color: '#64748b' }}>Status:</span>
              <span style={{ color: activeServer.risk > 0.9 ? '#ef4444' : '#f59e0b', fontSize: '0.68rem', fontWeight: '600' }}>
                {activeServer.risk > 0.9 ? 'CRITICAL: Sanctioned / >90% Anomaly' : 'ELEVATED: High Velocity Relay'}
              </span>
            </div>
            <div style={styles.dataRow}>
              <span style={{ ...styles.label, color: '#64748b' }}>Value & Latency:</span>
              <span style={{ color: '#f59e0b', fontWeight: '800' }}>{activeServer.amount} BTC | {activeServer.propDelay || 0.8}s</span>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}

const styles = {
  serverInspectionCard: {
    position: 'fixed',
    width: '300px',
    backdropFilter: 'blur(10px)',
    border: '1px solid',
    borderRadius: '8px',
    padding: '11px 13px',
    zIndex: 50,
    pointerEvents: 'none',
    transition: 'top 0.05s ease-out, left 0.05s ease-out'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid',
    paddingBottom: '4px',
    marginBottom: '6px'
  },
  closeCardBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.85rem',
    cursor: 'pointer',
    pointerEvents: 'auto'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  dataRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    fontSize: '0.68rem'
  },
  label: {
    fontSize: '0.62rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  zoomHint: {
    position: 'absolute',
    bottom: '75px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(2, 132, 199, 0.3)',
    borderRadius: '20px',
    padding: '4px 14px',
    fontSize: '0.65rem',
    color: '#0284c7',
    letterSpacing: '1px',
    pointerEvents: 'none',
    zIndex: 25,
  }
};