// src/components/Projects.js
import React from 'react';
import './Projects.css';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt'; // ✅ Add this line

const projects = [
  {
    title: 'College Management System',
    description: 'A Django-based web app to manage student records, courses, and grades.',
    tech: ['Django', 'Python', 'Bootstrap'],
    link: '#',
  },
  {
    title: 'Solventa Static Website',
    description: 'A clean, modern business website built with HTML, CSS, and JS.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    link: 'https://solventa.co.ke',
  },
  {
    title: 'Task Tracker App',
    description: 'A React app to manage tasks with CRUD functionality and Firebase backend.',
    tech: ['React', 'Firebase'],
    link: '#',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

const Projects = () => {
  return (
    <section className="projects" id="projects">
      <div className="projects-container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          My Projects
        </motion.h2>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <Tilt
              glareEnable={true}
              glareMaxOpacity={0.2}
              scale={1.02}
              transitionSpeed={1500}
              tiltMaxAngleX={10}
              tiltMaxAngleY={10}
              key={index}
            >
              <motion.div
                className="project-card"
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
              >
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tech-stack">
                  {project.tech.map((techItem, i) => (
                    <span key={i} className="tech-tag">
                      {techItem}
                    </span>
                  ))}
                </div>
                <a
                  href={project.link}
                  className="project-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Project
                </a>
              </motion.div>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
