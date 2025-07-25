// src/components/Contact.js
import React from 'react';
import './Contact.css';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const fadeVariant = {
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

const Contact = () => {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Contact Me
        </motion.h2>

        <motion.p
          className="intro"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          Let’s collaborate! Feel free to reach out if you have a project, question, or just want to say hi.
        </motion.p>

        <div className="contact-grid">
          <motion.div
            className="contact-info"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <FaEnvelope className="icon" />,
                label: <a href="mailto:kegokoramoseti192@gmail.com">kegokoramoseti192@gmail.com</a>,
              },
              {
                icon: <FaPhoneAlt className="icon" />,
                label: <a href="tel:+254712345678">+254 793 983 993</a>,
              },
              {
                icon: <FaMapMarkerAlt className="icon" />,
                label: <span>Nairobi, Kenya</span>,
              },
            ].map((item, i) => (
              <motion.div
                className="info-item"
                key={i}
                custom={i}
                variants={fadeVariant}
              >
                {item.icon}
                {item.label}
              </motion.div>
            ))}
          </motion.div>

          <motion.form
            className="contact-form"
            action="https://formspree.io/f/yourFormId"
            method="POST"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {['name', 'email'].map((field, i) => (
              <motion.input
                key={field}
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                placeholder={`Your ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                required
                custom={i}
                variants={fadeVariant}
              />
            ))}
            <motion.textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              required
              custom={2}
              variants={fadeVariant}
            />
            <motion.button type="submit" custom={3} variants={fadeVariant}>
              Send Message
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
