"use client";

import styles from './friends.module.css';
import Images from '@/Images';
import { useState } from 'react';
import All_Friends from './friend_pages/allFriend';
import Pending from './friend_pages/pending';
import Recommend from './friend_pages/recommend';
import Add_Friend from './friend_pages/addFriend';

export default function Friends() {
  const [whichActive, setWichActive] = useState('all');

  const handleActive = (target) => {
    setWichActive(target);
  };

  const renderComponent = () => {
    switch (whichActive) {
      case 'all':
        return <All_Friends />;
      case 'pending':
        return <Pending />;
      case 'recommand':
        return <Recommend />;
      case 'add':
        return <Add_Friend />;
      default:
        return <All_Friends />;
    }
  };

  return (
    <div className={styles.friends}>
      <header className={styles.header}>
        <div className={styles.headerWrap}>

          <div className={styles.frinedsTitle}>
            <div className={styles.friendSvg}>
              <Images.friends />
            </div>
            <div className={styles.friendsTxt}>친구</div>
          </div>

          <div className={styles.barricade} />

          <div className={styles.statusWrap}>
            <div className={`${styles.all}  ${whichActive === 'all' ? styles.statusActive : ''}`} onClick={() => handleActive('all')} >
              모두
            </div>

            <div className={`${styles.ready}  ${whichActive === 'pending' ? styles.statusActive : ''}`} onClick={() => handleActive('pending')}>
              대기 중
            </div>

            <div className={`${styles.recommand}  ${whichActive === 'recommand' ? styles.statusActive : ''}`} onClick={() => handleActive('recommand')}>
              추천
            </div>
          </div>

          <div className={styles.addFriend} onClick={() => handleActive('add')}>
            친구 추가하기
          </div>

        </div>
      </header >

      <div className={styles.body}>
        {renderComponent()}
      </div>
    </div >
  );
}
