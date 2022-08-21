// @ts-check
import React, { useMemo } from 'react';
import { getAvatarByUserAndRoomId } from '../../../../../utils';
import ChatIcon from './ChatIcon';

const AvatarImage = ({ name, id }) => {
  const url = useMemo(() => {
    const av = getAvatarByUserAndRoomId('' + id);
    if (name === 'Ahmet') {
      return `${process.env.PUBLIC_URL}/avatars/7.jpg`;
    } else if (name === 'Buğra') {
      return `${process.env.PUBLIC_URL}/avatars/12.jpg`;
    } else if (name === 'Ayşe') {
      return `${process.env.PUBLIC_URL}/avatars/4.jpg`;
    } else if (name === 'Nazlı') {
      return `${process.env.PUBLIC_URL}/avatars/5.jpg`;
    }
    return av;
  }, [id, name]);

  return (
    <>
      {name !== 'General' ? (
        <img
          src={url}
          alt={name}
          style={{ width: 32, height: 32, objectFit: 'cover' }}
          className="rounded-circle avatar-xs"
        />
      ) : (
        <div className="overflow-hidden rounded-circle">
          <ChatIcon />
        </div>
      )}
    </>
  );
};

export default AvatarImage;
