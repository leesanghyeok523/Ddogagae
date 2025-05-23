import {Alert, Linking} from 'react-native';
import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
  PermissionStatus,
} from 'react-native-permissions';
import Cookies from '@react-native-cookies/cookies';

// 설정으로 이동하는 Alert 표시 함수
const showSettingsAlert = (permissionType: string): void => {
  Alert.alert(
    `${permissionType} 권한 필요`,
    `앱에서 ${permissionType}를 사용하기 위해 권한이 필요합니다. 설정 화면에서 권한을 허용해주세요.`,
    [
      {
        text: '설정으로 이동',
        onPress: () => Linking.openSettings(),
      },
      {
        text: '취소',
        style: 'cancel',
      },
    ],
  );
};

// 카메라 권한 확인 함수
export const checkCameraPermission = async (): Promise<boolean> => {
  try {
    const result: PermissionStatus = await check(PERMISSIONS.ANDROID.CAMERA);
    console.log('카메라 권한 상태:', result);

    // 카메라 권한이 필요한 경우
    if (result === RESULTS.DENIED) {
      console.log('카메라 권한 요청 중...');
      const requestResult: PermissionStatus = await request(
        PERMISSIONS.ANDROID.CAMERA,
      );
      console.log('카메라 요청 결과:', requestResult);
    } else if (result === RESULTS.BLOCKED) {
      showSettingsAlert('카메라');
      return false; // 설정으로 이동하는 얼럿이 표시된 경우 함수 종료
    }

    // 최종 권한 상태 확인
    const finalResult: PermissionStatus = await check(
      PERMISSIONS.ANDROID.CAMERA,
    );
    if (finalResult === RESULTS.GRANTED) {
      console.log(
        '카메라 권한이 허용되어 있습니다. 카메라 기능을 사용할 수 있습니다.',
      );
      return true;
    } else {
      console.log('카메라 권한이 거부되어 있습니다.');
      return false;
    }
  } catch (error) {
    console.error('카메라 권한 확인 중 오류 발생:', error);
    return false;
  }
};
/**
 * 전화번호부 접근 권한을 확인하고 필요시 요청하는 함수
 * @returns 권한 처리 결과에 대한 Promise
 */
export const checkContactsPermission = async (): Promise<boolean> => {
  try {
    const result: PermissionStatus = await check(
      PERMISSIONS.ANDROID.READ_CONTACTS,
    );
    console.log('전화번호부 권한 상태:', result);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('이 기기에서는 전화번호부 기능을 사용할 수 없습니다.');
        return false;

      case RESULTS.DENIED:
        console.log('전화번호부 권한 요청 중...');
        const requestResult: PermissionStatus = await request(
          PERMISSIONS.ANDROID.READ_CONTACTS,
        );
        console.log('요청 결과:', requestResult);
        return requestResult === RESULTS.GRANTED;

      case RESULTS.BLOCKED:
        // 권한이 영구적으로 차단된 경우 설정으로 이동하도록 안내
        Alert.alert(
          '전화번호부 권한 필요',
          '앱에서 연락처 정보에 접근하기 위해 권한이 필요합니다. 설정 화면에서 권한을 허용해주세요.',
          [
            {
              text: '설정으로 이동',
              onPress: () => Linking.openSettings(),
            },
            {
              text: '취소',
              style: 'cancel',
            },
          ],
        );
        return false;

      case RESULTS.GRANTED:
        console.log('전화번호부 권한이 이미 허용되어 있습니다.');
        return true;

      default:
        return false;
    }
  } catch (error: unknown) {
    console.error('전화번호부 권한 확인 중 오류 발생:', error);
    return false;
  }
};
/**
 * 저장소(사진첩) 접근 권한을 확인하고 필요시 요청하는 함수
 * @returns 권한 처리 결과에 대한 Promise
 */
export const checkStoragePermission = async (): Promise<boolean> => {
  try {
    // 이미지 권한 상태 확인 (기준 권한으로 사용)
    const result: PermissionStatus = await check(
      PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    );
    console.log('저장소 권한 상태:', result);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('이 기기에서는 저장소 접근 기능을 사용할 수 없습니다.');
        return false;

      case RESULTS.DENIED:
        console.log('저장소 권한 요청 중...');
        // 모든 미디어 권한 요청
        const imageResult = await request(
          PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        );
        const videoResult = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
        const audioResult = await request(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);

        console.log('미디어 권한 요청 결과:', {
          imageResult,
          videoResult,
          audioResult,
        });

        // 모든 권한이 허용되었는지 확인
        return (
          imageResult === RESULTS.GRANTED &&
          videoResult === RESULTS.GRANTED &&
          audioResult === RESULTS.GRANTED
        );

      case RESULTS.BLOCKED:
        // 권한이 영구적으로 차단된 경우 설정으로 이동하도록 안내
        Alert.alert(
          '사진 접근 권한 필요',
          '앱에서 사진첩/갤러리에 접근하기 위해 권한이 필요합니다. 설정 화면에서 권한을 허용해주세요.',
          [
            {
              text: '설정으로 이동',
              onPress: () => Linking.openSettings(),
            },
            {
              text: '취소',
              style: 'cancel',
            },
          ],
        );
        return false;

      case RESULTS.GRANTED:
        console.log(
          '이미지 권한이 이미 허용되어 있습니다. 나머지 권한 확인 중...',
        );
        // 다른 권한들도 이미 허용되어 있는지 확인
        const videoCheck = await check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);

        // 일부 권한이 없다면 요청
        console.log('일부 미디어 권한이 없습니다. 권한 요청 중...');
        const missingVideoResult =
          videoCheck !== RESULTS.GRANTED
            ? await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO)
            : RESULTS.GRANTED;

        return missingVideoResult === RESULTS.GRANTED;

      default:
        return false;
    }
  } catch (error: unknown) {
    console.error('저장소 권한 확인 중 오류 발생:', error);
    return false;
  }
};
/**
 * 위치 권한을 확인하고 필요시 요청하는 함수
 * @returns 권한 처리 결과에 대한 Promise
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const result: PermissionStatus = await check(
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );
    console.log('위치 권한 상태:', result);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('이 기기에서는 위치 기능을 사용할 수 없습니다.');
        return false;

      case RESULTS.DENIED:
        console.log('위치 권한 요청 중...');
        const requestResult: PermissionStatus = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );
        console.log('요청 결과:', requestResult);
        return requestResult === RESULTS.GRANTED;

      case RESULTS.BLOCKED:
        // 권한이 영구적으로 차단된 경우 설정으로 이동하도록 안내
        Alert.alert(
          '위치 권한 필요',
          '앱에서 위치 정보를 사용하기 위해 권한이 필요합니다. 설정 화면에서 권한을 허용해주세요.',
          [
            {
              text: '설정으로 이동',
              onPress: () => Linking.openSettings(),
            },
            {
              text: '취소',
              style: 'cancel',
            },
          ],
        );
        return false;

      case RESULTS.GRANTED:
        console.log('위치 권한이 이미 허용되어 있습니다.');
        return true;

      default:
        return false;
    }
  } catch (error: unknown) {
    console.error('위치 권한 확인 중 오류 발생:', error);
    return false;
  }
};

export const requestAllPermissionsAndSetCookie = async (): Promise<boolean> => {
  try {
    const cameraAudioGranted = await checkCameraPermission();
    const contactsGranted = await checkContactsPermission();
    const storageGranted = await checkStoragePermission();
    const locationGranted = await checkLocationPermission();

    if (
      cameraAudioGranted &&
      contactsGranted &&
      storageGranted &&
      locationGranted
    ) {
      console.log(
        '모든 권한이 허용되었습니다. accessPermission 쿠키를 설정합니다.',
      );
      await Cookies.set('https://j12e106.p.ssafy.io', {
        name: 'accessPermission',
        value: 'true',
        // domain: 'localhost',
        path: '/',
        expires: new Date(Date.now() + 864e5).toISOString(), // 1일 후 만료
      });
      const cookies = await Cookies.get('https://j12e106.p.ssafy.io');
      console.log('Cookies:', cookies);
      return true;
    } else {
      console.log(
        '일부 권한이 거부되어 accessPermission 쿠키를 설정하지 않습니다.',
      );
      return false;
    }
  } catch (error) {
    console.error('모든 권한 확인 중 오류 발생:', error);
    return false;
  }
};
