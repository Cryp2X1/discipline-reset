import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  type ScrollViewInstance, type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from '@/lib/theme';
import type { Mark } from '@/lib/types';

type TP = { children: React.ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number };

export const Display = ({ children, style, numberOfLines }: TP) => {
  const flat = (StyleSheet.flatten([s.display, style]) ?? {}) as TextStyle;
  const lh = flat.lineHeight ?? Math.round((flat.fontSize ?? 28) * 1.14);
  return <Text numberOfLines={numberOfLines} style={[s.display, style, { lineHeight: lh }]}>{children}</Text>;
};
export const Mono = ({ children, style, numberOfLines }: TP) => (
  <Text numberOfLines={numberOfLines} style={[s.mono, style]}>{children}</Text>
);
export const Body = ({ children, style }: TP) => <Text style={[s.body, style]}>{children}</Text>;

/** Renders text where *wrapped* segments are italic (as in the printed workbook). */
export function Rich({ text, style, italicStyle }: { text: string; style?: StyleProp<TextStyle>; italicStyle?: StyleProp<TextStyle> }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <Text style={[s.body, style]}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <Text key={i} style={{ fontFamily: F.heavy }}>{p.slice(2, -2)}</Text>
          : p.startsWith('*') && p.endsWith('*')
            ? <Text key={i} style={[{ fontFamily: F.bodyItalic, fontStyle: 'italic' }, italicStyle]}>{p.slice(1, -1)}</Text>
            : <Text key={i}>{p}</Text>,
      )}
    </Text>
  );
}

export function SecTag({ title, style, dark }: { title: string; style?: StyleProp<ViewStyle>; dark?: boolean }) {
  return (
    <View style={[s.secRow, style]}>
      <View style={[s.secTag, dark && { backgroundColor: C.yellow }]}>
        <Text style={[s.secTagText, dark && { color: C.black }]}>{title}</Text>
      </View>
      <View style={[s.secRule, dark && { backgroundColor: C.white }]} />
    </View>
  );
}

export function Label({ children, style, muted = true }: TP & { muted?: boolean }) {
  return <Text style={[s.label, muted && { color: '#666' }, style]}>{children}</Text>;
}

type FieldProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  lines?: number;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  dark?: boolean;
  keyboardType?: 'default' | 'numbers-and-punctuation' | 'number-pad';
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words';
};

/** A ruled-line text field (like the workbook) that keeps typing smooth and autosaves. */
export function Field({ label, value, onChange, placeholder, lines = 1, style, inputStyle, dark, keyboardType, maxLength, autoCapitalize }: FieldProps) {
  const [local, setLocal] = useState(value);
  const focused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const flush = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (pending.current !== null) { const v = pending.current; pending.current = null; onChangeRef.current(v); }
  };
  useEffect(() => { if (!focused.current) setLocal(value); }, [value]);
  // Never lose typing: save whatever is pending when the field goes away (step change, navigation).
  useEffect(() => () => flush(), []); // eslint-disable-line react-hooks/exhaustive-deps
  const push = (v: string) => {
    pending.current = v;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 250);
  };
  const minH = lines > 1 ? lines * 26 + 8 : 36;
  return (
    <View style={style}>
      {label ? <Label style={dark && { color: '#aaa' }}>{label}</Label> : null}
      <TextInput
        value={local}
        onChangeText={(v) => { setLocal(v); push(v); }}
        onFocus={() => { focused.current = true; }}
        onBlur={() => { focused.current = false; flush(); }}
        placeholder={placeholder}
        placeholderTextColor={dark ? '#666' : '#aaa'}
        multiline={lines > 1}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        textAlignVertical={lines > 1 ? 'top' : 'center'}
        style={[s.input, { minHeight: minH }, dark && s.inputDark, inputStyle]}
      />
    </View>
  );
}

export function Check({ checked, onToggle, label, style, size = 22, dark, labelStyle }: {
  checked: boolean; onToggle: () => void; label?: string; style?: StyleProp<ViewStyle>; size?: number; dark?: boolean; labelStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Pressable onPress={onToggle} hitSlop={6} accessibilityRole="checkbox" accessibilityState={{ checked }} style={[s.checkRow, style]}>
      <View style={[s.box, { width: size, height: size }, dark && { borderColor: C.white }, checked && { backgroundColor: dark ? C.yellow : C.black, borderColor: dark ? C.yellow : C.black }]}>
        {checked ? <Text style={[s.tick, { fontSize: size * 0.62, color: dark ? C.black : C.yellow }]}>✓</Text> : null}
      </View>
      {label ? <Text style={[s.checkLabel, dark && { color: C.white }, labelStyle]}>{label}</Text> : null}
    </Pressable>
  );
}

/** Tri-state habit box: empty → ✓ done → ½ (2-minute minimum) → empty. */
export function MarkBox({ mark, onChange, size = 30 }: { mark: Mark; onChange: (m: Mark) => void; size?: number }) {
  const next: Mark = mark === null ? 'done' : mark === 'done' ? 'min' : null;
  return (
    <Pressable onPress={() => onChange(next)} hitSlop={6} accessibilityRole="button"
      accessibilityLabel={mark === 'done' ? 'Done' : mark === 'min' ? '2-minute minimum' : 'Not done'}
      style={[s.box, { width: size, height: size }, mark === 'done' && { backgroundColor: C.black }, mark === 'min' && { backgroundColor: C.yellow }]}>
      {mark === 'done' ? <Text style={[s.tick, { color: C.yellow, fontSize: size * 0.6 }]}>✓</Text> : null}
      {mark === 'min' ? <Text style={[s.tick, { color: C.black, fontSize: size * 0.5 }]}>½</Text> : null}
    </Pressable>
  );
}

export function ScoreRow({ value, onChange, dark, size = 30 }: { value: number | null; onChange: (n: number | null) => void; dark?: boolean; size?: number }) {
  return (
    <View style={s.scoreRow}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const on = value === n;
        return (
          <Pressable key={n} onPress={() => onChange(on ? null : n)} hitSlop={2}
            accessibilityRole="button" accessibilityLabel={`Score ${n}`} accessibilityState={{ selected: on }}
            style={[s.circ, { width: size, height: size, borderRadius: size / 2 }, dark && { borderColor: '#888' }, on && { backgroundColor: C.yellow, borderColor: C.black, borderWidth: 2 }]}>
            <Text style={[s.circText, dark && !on && { color: C.white }, on && { color: C.black }]}>{n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Btn({ title, onPress, kind = 'yellow', style, disabled, small }: {
  title: string; onPress: () => void; kind?: 'yellow' | 'black' | 'outline' | 'outlineLight'; style?: StyleProp<ViewStyle>; disabled?: boolean; small?: boolean;
}) {
  const bg = kind === 'yellow' ? C.yellow : kind === 'black' ? C.black : 'transparent';
  const fg = kind === 'yellow' ? C.black : kind === 'black' ? C.yellow : kind === 'outlineLight' ? C.white : C.black;
  const border = kind === 'outline' ? C.black : kind === 'outlineLight' ? C.white : bg;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={({ pressed }) => [s.btn, small && s.btnSmall, { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 }, style]}>
      <Text style={[s.btnText, small && { fontSize: 16 }, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function YBox({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.ybox, style]}>{children}</View>;
}

/** Page wrapper: scrolls, avoids the keyboard, white "paper" background by default. */
export function Page({ children, dark, contentStyle, topInset = false, scrollRef }: {
  children: React.ReactNode; dark?: boolean; contentStyle?: StyleProp<ViewStyle>; topInset?: boolean; scrollRef?: React.Ref<ScrollViewInstance>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: dark ? C.black : C.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={[{ paddingBottom: 48, paddingTop: topInset ? insets.top : 0 }, contentStyle]}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Dark header band with a big display title and a yellow rule below (matches the daily page). */
export function DarkHeader({ big, kicker, title, right, topInset = true, children }: {
  big?: string; kicker?: string; title?: string; right?: React.ReactNode; topInset?: boolean; children?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View>
      <View style={[s.header, { paddingTop: (topInset ? insets.top : 0) + 18 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14 }}>
          {big ? <Display style={s.headerBig}>{big}</Display> : null}
          <View style={{ flex: 1, paddingBottom: 4 }}>
            {kicker ? <Mono style={{ color: '#aaa' }}>{kicker}</Mono> : null}
            {title ? <Display style={s.headerTitle}>{title}</Display> : null}
          </View>
          {right}
        </View>
        {children}
      </View>
      <View style={{ height: 6, backgroundColor: C.yellow }} />
    </View>
  );
}

export function PaperHeader({ kicker, title, badge, badgeDark }: { kicker: string; title: string; badge?: string; badgeDark?: boolean }) {
  return (
    <View style={s.paperHeader}>
      <View style={{ flex: 1 }}>
        <Mono>{kicker}</Mono>
        <Display style={{ fontSize: 32, marginTop: 6 }}>{title}</Display>
      </View>
      {badge ? (
        <View style={[s.badge, badgeDark && { backgroundColor: C.black }]}>
          <Display style={[{ fontSize: 26 }, badgeDark && { color: C.yellow }]}>{badge}</Display>
        </View>
      ) : null}
    </View>
  );
}

export const s = StyleSheet.create({
  display: { fontFamily: F.display, textTransform: 'uppercase', color: C.black, fontSize: 28, letterSpacing: 0.3 },
  mono: { fontFamily: F.monoBold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: C.black },
  body: { fontFamily: F.body, fontSize: 16, lineHeight: 23, color: C.black },
  label: { fontFamily: F.monoBold, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: C.black, marginBottom: 2 },
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  secTag: { backgroundColor: C.black, paddingHorizontal: 8, paddingVertical: 3 },
  secTagText: { fontFamily: F.monoBold, color: C.yellow, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase' },
  secRule: { flex: 1, height: 2, backgroundColor: C.black },
  input: { fontFamily: F.body, fontSize: 16, color: C.black, borderBottomWidth: 1, borderBottomColor: C.lightGrey, paddingVertical: 6, paddingHorizontal: 0, lineHeight: 22 },
  inputDark: { color: C.white, borderBottomColor: '#555' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  box: { borderWidth: 2, borderColor: C.black, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  tick: { fontFamily: F.heavy, lineHeight: undefined },
  checkLabel: { fontFamily: F.medium, fontSize: 16, color: C.black, flexShrink: 1 },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  circ: { borderWidth: 1.5, borderColor: C.black, alignItems: 'center', justifyContent: 'center' },
  circText: { fontFamily: F.monoBold, fontSize: 12, color: C.black },
  btn: { borderWidth: 2.5, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  btnSmall: { paddingVertical: 9, paddingHorizontal: 12 },
  btnText: { fontFamily: F.display, fontSize: 20, textTransform: 'uppercase', letterSpacing: 0.6 },
  ybox: { backgroundColor: C.yellow, padding: 14 },
  header: { backgroundColor: C.black, paddingHorizontal: 20, paddingBottom: 16 },
  headerBig: { color: C.yellow, fontSize: 64, lineHeight: 64, marginBottom: -6 },
  headerTitle: { color: C.white, fontSize: 24, lineHeight: 26, marginTop: 4 },
  paperHeader: { flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 4, borderBottomColor: C.black, paddingBottom: 10, marginBottom: 14, gap: 10 },
  badge: { backgroundColor: C.yellow, paddingHorizontal: 10, paddingTop: 4, paddingBottom: 2 },
});
