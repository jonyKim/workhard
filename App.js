import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";

import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { theme } from "./colors";

const STORAGE_TODOS_KEY = "@toDos";
const STORAGE_LAST_MODE = "@mode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const travel = async () => {
    setWorking(false);
    await saveWorking(false);
  };

  const work = async () => {
    setWorking(true);
    await saveWorking(true);
  };

  const onChangeText = (payload) => setText(payload);

  const saveWorking = async (mode) => {
    const s = JSON.stringify(mode);
    try {
      await AsyncStorage.setItem(STORAGE_LAST_MODE, s);
    } catch (err) {}
  };

  const loadWorking = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_LAST_MODE);
      setWorking(JSON.parse(s));
    } catch (err) {}
  };

  const saveToDos = async (toSave) => {
    const s = JSON.stringify(toSave);
    try {
      await AsyncStorage.setItem(STORAGE_TODOS_KEY, s);
    } catch (err) {}
  };

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_TODOS_KEY);
      if (s) {
        setToDos(JSON.parse(s));
      }
    } catch (err) {}
  };

  const finishToDo = async (key, finished) => {
    const newToDos = {
      ...toDos,
    };

    try {
      newToDos[key].finished = finished;
      setToDos(newToDos);
      await saveToDos(newToDos);
    } catch (err) {}
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, finished: false },
    };

    await saveToDos(newToDos);
    setToDos(newToDos);
    setText("");
  };

  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        try {
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        } catch (err) {}
      }
    } else {
      Alert.alert("Delete To Do?", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm sure",
          onPress: async () => {
            const newToDos = { ...toDos };
            try {
              delete newToDos[key];
              setToDos(newToDos);
              saveToDos(newToDos);
            } catch (err) {}
          },
        },
      ]);
    }
  };

  useEffect(() => {
    loadWorking();
    loadToDos();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => work()}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => travel()}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View key={key} style={styles.toDo}>
              {toDos[key].finished ? (
                <TouchableOpacity onPress={() => finishToDo(key, false)}>
                  <Fontisto name="checkbox-active" size={18} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => finishToDo(key, true)}>
                  <Fontisto name="checkbox-passive" size={18} color="white" />
                </TouchableOpacity>
              )}
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
