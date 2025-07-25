// src/components/Hero.js
import React from 'react';
import { motion } from 'framer-motion';
import { FaTwitter, FaGithub, FaInstagram } from 'react-icons/fa';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles'; // ✅ FIXED import path
import './Hero.css';
import avatar from '../assets/avatar.png';

const Hero = () => {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <section className="hero" id="home">
      {/* 3D Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: "#0f172a" },
          fpsLimit: 60,
          particles: {
            number: { value: 60, density: { enable: true, area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5 },
            size: { value: 2 },
            move: { enable: true, speed: 1 },
            links: {
              enable: true,
              distance: 120,
              color: "#00ffff",
              opacity: 0.5,
              width: 1,
            },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              onClick: { enable: true, mode: "push" },
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 },
              push: { quantity: 2 },
            },
          },
        }}
      />

      {/* Hero Content */}
      <div className="hero-content">
        <motion.img
          src={avatar}
          alt="Ben Moseti"
          className="hero-avatar"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />

        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Hi 👋, I'm <span className="highlight">Ben Moseti</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          A full-stack developer building <strong>scalable</strong>, <strong>visually rich</strong> experiences for the web.
        </motion.p>

        <motion.div
          className="hero-socials"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <a href="https://twitter.com/____drx" target="_blank" rel="noreferrer"><FaTwitter /></a>
          <a href="https://github.com/vaezakmi" target="_blank" rel="noreferrer"><FaGithub /></a>
          <a href="https://instagram.com/____.aizen" target="_blank" rel="noreferrer"><FaInstagram /></a>
        </motion.div>

        <motion.a
          href="#about"
          className="scroll-down"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          ↓ Scroll Down
        </motion.a>
      </div>
    </section>
  );
};

export default Hero;
