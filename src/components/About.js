// src/components/About.js
import React from 'react';
import './About.css';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import Typewriter from 'typewriter-effect';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.3,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

const About = () => {
  return (
    <section className="about" id="about">
      {/* 3D Blob Background */}
      <div className="blob-bg"></div>

      <div className="about-container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          About Me
        </motion.h2>

        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.2}>
          <motion.div
            className="about-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="typewriter-intro">
              <Typewriter
                options={{
                  strings: ['Full-Stack Developer', 'Creative Thinker', 'Problem Solver'],
                  autoStart: true,
                  loop: true,
                  delay: 60,
                  deleteSpeed: 30,
                }}
              />
            </div>

            <div className="about-content">
              {[...Array(2)].map((_, i) => (
                <motion.p
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                >
                  {i === 0 ? (
                    <>
                      I'm a passionate <span className="highlight">full-stack developer</span> based in Kenya,
                      focused on building fast, accessible, and visually polished digital experiences. I work
                      with modern tools like <span className="tech">React</span>, <span className="tech">Django</span>,
                      <span className="tech">Node.js</span>, and more.
                    </>
                  ) : (
                    <>
                      I thrive on solving real-world problems with clean, scalable code. Whether it’s a startup
                      idea, enterprise platform, or creative side project — I bring both <em>logic</em> and
                      <em> creativity</em> to the table.
                    </>
                  )}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </Tilt>
      </div>
    </section>
  );
};

export default About;
